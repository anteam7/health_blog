import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import type { HealthContent } from "@/lib/contents";
import type {
  HealthBlogPostReview,
  ReviewPerspectivePreset,
} from "@/lib/reviews";
import ContentEditor from "./ContentEditor";
import ReviewPanel from "./ReviewPanel";

export const dynamic = "force-dynamic";

interface SourceCitation {
  id: string;
  source_type: string;
  title: string;
  url: string;
  doi: string | null;
  pmid: string | null;
  outlet: string | null;
  authors: string[] | null;
  published_date: string | null;
}

export default async function ContentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = createAdminClient();

  const [{ data: postRaw, error }, { data: reviewsRaw }, { data: perspectivesRaw }] =
    await Promise.all([
      sb.from("health_contents").select("*").eq("id", id).maybeSingle(),
      sb
        .from("health_blog_post_reviews")
        .select("*")
        .eq("content_id", id)
        .order("created_at", { ascending: false }),
      sb
        .from("health_blog_review_perspectives")
        .select("id, name, created_at, created_by")
        .order("created_at", { ascending: false }),
    ]);
  if (error || !postRaw) notFound();
  const post = postRaw as HealthContent;
  const reviews = (reviewsRaw ?? []) as HealthBlogPostReview[];
  const perspectives = (perspectivesRaw ?? []) as ReviewPerspectivePreset[];

  let topicTitle: string | null = null;
  if (post.topic_id) {
    const { data: t } = await sb
      .from("health_topics")
      .select("title")
      .eq("id", post.topic_id)
      .maybeSingle();
    topicTitle = t?.title ?? null;
  }

  let sources: SourceCitation[] = [];
  if (post.source_ids && post.source_ids.length > 0) {
    const { data } = await sb
      .from("health_sources")
      .select(
        "id, source_type, title, url, doi, pmid, outlet, authors, published_date",
      )
      .in("id", post.source_ids);
    sources = (data ?? []) as SourceCitation[];
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/admin/contents"
          className="text-sm text-gray-500 hover:underline"
        >
          ← 콘텐츠 목록
        </Link>
      </div>

      <ReviewPanel
        contentId={post.id}
        reviews={reviews}
        savedPerspectives={perspectives}
      />

      <ContentEditor
        key={post.updated_at}
        initial={post}
        topicTitle={topicTitle}
        sources={sources}
      />
    </div>
  );
}
