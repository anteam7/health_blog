import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import { Badge } from "@/components/ui/badge";
import { contentStatusLabel, type HealthContent } from "@/lib/contents";

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

export default async function ContentPreviewPage({
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

  const publicHref =
    post.status === "published" ? `/blog/${post.slug}` : null;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/contents"
          className="text-sm text-gray-500 hover:underline"
        >
          ← 콘텐츠 목록
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{post.title}</h1>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-mono">{post.slug}</span>
              {topicTitle && post.topic_id && (
                <>
                  {" · 토픽: "}
                  <Link
                    href={`/admin/topics/${post.topic_id}`}
                    className="hover:underline"
                  >
                    {topicTitle}
                  </Link>
                </>
              )}
              {" · 수정 "}
              {new Date(post.updated_at).toLocaleString("ko-KR")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {publicHref && (
              <Link
                href={publicHref}
                target="_blank"
                rel="noopener"
                className="text-xs text-blue-700 hover:underline"
              >
                공개 페이지 ↗
              </Link>
            )}
            <Badge
              variant={post.status === "published" ? "default" : "secondary"}
            >
              {contentStatusLabel(post.status)}
            </Badge>
          </div>
        </div>
        {post.excerpt && (
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border bg-white px-6 py-6">
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 leading-relaxed">
          <strong>어드민 미리보기</strong>
          {post.status !== "published" &&
            " · 이 글은 아직 발행되지 않았으므로 공개 페이지(/blog)에는 노출되지 않습니다."}
        </div>
        <article className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-a:text-blue-700 prose-a:underline-offset-2">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: (props) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          >
            {post.body_md ?? ""}
          </ReactMarkdown>
        </article>

        {sources.length > 0 && (
          <section className="mt-10 border-t pt-6">
            <h2 className="text-base font-semibold mb-3">
              출처 ({sources.length})
            </h2>
            <ol className="space-y-3 text-sm">
              {sources.map((s, i) => (
                <li key={s.id} className="leading-relaxed">
                  <span className="text-gray-500 mr-2">[{i + 1}]</span>
                  {s.authors && s.authors.length > 0 && (
                    <span>
                      {s.authors.slice(0, 3).join(", ")}
                      {s.authors.length > 3 ? " et al." : ""}.{" "}
                    </span>
                  )}
                  <span className="font-medium">{s.title}</span>.{" "}
                  {s.outlet && <em className="text-gray-700">{s.outlet}</em>}
                  {s.published_date && (
                    <span className="text-gray-600">
                      , {new Date(s.published_date).getFullYear()}
                    </span>
                  )}
                  .{" "}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {s.source_type === "paper" ? "PubMed" : "원문"}
                  </a>
                  {s.doi && (
                    <>
                      {" · "}
                      <a
                        href={`https://doi.org/${s.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        DOI
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
