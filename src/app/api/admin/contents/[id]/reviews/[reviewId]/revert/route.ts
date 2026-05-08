import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string; reviewId: string }> },
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id, reviewId } = await ctx.params;
  const sb = createAdminClient();

  const { data: review } = await sb
    .from("health_blog_post_reviews")
    .select(
      "id, content_id, title_before, excerpt_before, body_md_before, applied, reverted_at",
    )
    .eq("id", reviewId)
    .eq("content_id", id)
    .maybeSingle();

  if (!review) {
    return NextResponse.json({ error: "review_not_found" }, { status: 404 });
  }
  if (!review.applied || review.reverted_at) {
    return NextResponse.json(
      { error: "이미 원복되었거나 반영되지 않은 검토입니다" },
      { status: 400 },
    );
  }

  const { data: post } = await sb
    .from("health_contents")
    .select("slug, status")
    .eq("id", id)
    .maybeSingle<{ slug: string; status: string }>();

  if (!post) {
    return NextResponse.json({ error: "content_not_found" }, { status: 404 });
  }

  const { error: upErr } = await sb
    .from("health_contents")
    .update({
      title: review.title_before,
      excerpt: review.excerpt_before,
      body_md: review.body_md_before,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { error: revErr } = await sb
    .from("health_blog_post_reviews")
    .update({ reverted_at: new Date().toISOString() })
    .eq("id", reviewId);

  if (revErr) {
    return NextResponse.json({ error: revErr.message }, { status: 500 });
  }

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "revert_review",
    target_type: "health_content",
    target_id: id,
    payload: { review_id: reviewId },
  });

  if (post.status === "published") {
    try {
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath("/blog");
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ ok: true });
}
