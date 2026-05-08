import { NextResponse } from "next/server";
import { createClient as createSSRClient, isAdminEmail } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/auth/admin-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("health_blog_review_perspectives")
    .select("id, name, created_at, created_by")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ perspectives: data ?? [] });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const body = (await req.json().catch(() => ({}))) as { name?: unknown };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "관점 이름 필수" }, { status: 400 });
  if (name.length > 40)
    return NextResponse.json({ error: "관점 이름은 40자 이내" }, { status: 400 });

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("health_blog_review_perspectives")
    .upsert(
      { name, created_by: guard.user!.email ?? null },
      { onConflict: "name" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ perspective: data });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  const sb = createAdminClient();
  const { error } = await sb
    .from("health_blog_review_perspectives")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
