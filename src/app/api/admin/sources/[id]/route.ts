import { NextResponse } from "next/server";
import { createClient as createSSRClient, isAdminEmail } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/auth/admin-supabase";

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
    .from("health_sources")
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
  if (body.source_type !== undefined) update.source_type = String(body.source_type);
  if (body.title !== undefined) update.title = String(body.title).trim();
  if (body.url !== undefined) update.url = String(body.url).trim();
  if (body.doi !== undefined) update.doi = nullableStr(body.doi);
  if (body.pmid !== undefined) update.pmid = nullableStr(body.pmid);
  if (body.authors !== undefined) update.authors = stringArray(body.authors);
  if (body.outlet !== undefined) update.outlet = nullableStr(body.outlet);
  if (body.published_date !== undefined)
    update.published_date = nullableStr(body.published_date);
  if (body.abstract !== undefined) update.abstract = nullableStr(body.abstract);
  if (body.key_findings !== undefined) update.key_findings = nullableStr(body.key_findings);
  if (body.topics !== undefined) update.topics = stringArray(body.topics);
  if (body.quality_score !== undefined)
    update.quality_score = toIntOrNull(body.quality_score, 1, 5);
  if (body.status !== undefined) update.status = String(body.status);
  if (body.notes !== undefined) update.notes = nullableStr(body.notes);
  if (body.linked_content_id !== undefined)
    update.linked_content_id = nullableStr(body.linked_content_id);

  if ("title" in update && !update.title)
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  if ("url" in update && !update.url)
    return NextResponse.json({ error: "url_required" }, { status: 400 });

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("health_sources")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "update_source",
    target_type: "health_source",
    target_id: id,
    payload: { fields: Object.keys(update) },
  });

  return NextResponse.json({ row: data });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await ctx.params;
  const sb = createAdminClient();
  const { error } = await sb.from("health_sources").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "delete_source",
    target_type: "health_source",
    target_id: id,
  });

  return NextResponse.json({ ok: true });
}

function nullableStr(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
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

function toIntOrNull(v: unknown, min: number, max: number): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i < min || i > max) return null;
  return i;
}
