import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import type { HealthContent } from "@/lib/contents";
import ContentEditor from "./ContentEditor";

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

  const { data: postRaw, error } = await sb
    .from("health_contents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !postRaw) notFound();
  const post = postRaw as HealthContent;

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

      <ContentEditor
        key={post.updated_at}
        initial={post}
        topicTitle={topicTitle}
        sources={sources}
      />
    </div>
  );
}
