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

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const sourceType = url.searchParams.get("type");
  const q = url.searchParams.get("q");

  const sb = createAdminClient();
  let query = sb
    .from("health_sources")
    .select("*")
    .order("collected_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);
  if (sourceType) query = query.eq("source_type", sourceType);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const insert = {
    source_type: String(body.source_type ?? "paper"),
    title: String(body.title ?? "").trim(),
    url: String(body.url ?? "").trim(),
    doi: nullableStr(body.doi),
    pmid: nullableStr(body.pmid),
    authors: stringArray(body.authors),
    outlet: nullableStr(body.outlet),
    published_date: nullableStr(body.published_date),
    abstract: nullableStr(body.abstract),
    key_findings: nullableStr(body.key_findings),
    topics: stringArray(body.topics),
    quality_score: toIntOrNull(body.quality_score, 1, 5),
    status: String(body.status ?? "collected"),
    notes: nullableStr(body.notes),
    collected_by: guard.user!.email ?? null,
  };

  if (!insert.title) return NextResponse.json({ error: "title_required" }, { status: 400 });
  if (!insert.url) return NextResponse.json({ error: "url_required" }, { status: 400 });

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("health_sources")
    .insert(insert)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "create_source",
    target_type: "health_source",
    target_id: data.id,
    payload: { title: data.title, source_type: data.source_type },
  });

  return NextResponse.json({ row: data });
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
