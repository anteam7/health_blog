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

  const { data, error } = await sb
    .from("health_contents")
    .update({
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "unpublish_content",
    target_type: "health_content",
    target_id: id,
    payload: { slug: data.slug },
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
