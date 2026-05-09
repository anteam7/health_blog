import { NextResponse } from "next/server";
import { createClient as createSSRClient, isAdminEmail } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import { CONTENT_STATUSES } from "@/lib/contents";
import {
  isBlogCategorySlug,
  EVIDENCE_LEVELS,
} from "@/lib/categories";
import { revalidateContentPaths } from "@/lib/revalidate-content";

async function requireAdmin() {
  const supabase = await createSSRClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { user: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { user, response: null as null };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await ctx.params;
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("health_contents")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ row: data });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = String(body.title).trim();
  if (body.excerpt !== undefined) update.excerpt = nullableStr(body.excerpt);
  if (body.body_md !== undefined) update.body_md = nullableStr(body.body_md);
  if (body.cover_image_url !== undefined)
    update.cover_image_url = nullableStr(body.cover_image_url);
  if (body.tags !== undefined) update.tags = stringArray(body.tags);
  if (body.status !== undefined) {
    const s = String(body.status);
    if (!CONTENT_STATUSES.some((x) => x.value === s)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    update.status = s;
  }

  // AdSense / E-E-A-T 메타 (2026-05-09)
  if (body.category !== undefined) {
    const v = nullableStr(body.category);
    if (v !== null && !isBlogCategorySlug(v)) {
      return NextResponse.json({ error: "invalid_category" }, { status: 400 });
    }
    update.category = v;
  }
  if (body.evidence_level !== undefined) {
    const v = nullableStr(body.evidence_level);
    if (v !== null && !EVIDENCE_LEVELS.some((e) => e.value === v)) {
      return NextResponse.json({ error: "invalid_evidence_level" }, { status: 400 });
    }
    update.evidence_level = v;
  }
  if (body.author_name !== undefined)
    update.author_name = nullableStr(body.author_name);
  if (body.author_credential !== undefined)
    update.author_credential = nullableStr(body.author_credential);
  if (body.reviewer_name !== undefined)
    update.reviewer_name = nullableStr(body.reviewer_name);
  if (body.reviewer_credential !== undefined)
    update.reviewer_credential = nullableStr(body.reviewer_credential);
  if (body.reviewed_at !== undefined) {
    const v = body.reviewed_at;
    if (v === null || v === "" || v === undefined) {
      update.reviewed_at = null;
    } else {
      const d = new Date(String(v));
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "invalid_reviewed_at" }, { status: 400 });
      }
      update.reviewed_at = d.toISOString();
    }
  }

  if ("title" in update && !update.title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }

  update.updated_at = new Date().toISOString();

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("health_contents")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "update_content",
    target_type: "health_content",
    target_id: id,
    payload: { fields: Object.keys(update).filter((k) => k !== "updated_at") },
  });

  if (data?.slug) {
    revalidateContentPaths({ slug: data.slug, category: data.category });
  }

  return NextResponse.json({ row: data });
}

function nullableStr(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v);
  const trimmed = s.trim();
  return trimmed ? s : null;
}

function stringArray(v: unknown): string[] | null {
  if (Array.isArray(v)) {
    const arr = v.map((x) => String(x).trim()).filter(Boolean);
    return arr.length ? arr : null;
  }
  if (typeof v === "string") {
    const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : null;
  }
  return null;
}
