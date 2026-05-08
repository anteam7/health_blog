import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await ctx.params;
  const sb = createAdminClient();

  const { data: existing } = await sb
    .from("health_contents")
    .select("id, slug, published_at")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("health_contents")
    .update({
      status: "published",
      published_at: existing.published_at ?? now,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "publish_content",
    target_type: "health_content",
    target_id: id,
    payload: { slug: data.slug, first_publish: !existing.published_at },
  });

  try {
    revalidatePath(`/blog/${data.slug}`);
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
  } catch {
    // best-effort
  }

  return NextResponse.json({ row: data });
}
