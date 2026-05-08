import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 600;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";
const SITE_NAME = "헬스스캐너";
const AUTHOR_NAME = "헬스스캐너 편집부";

interface Post {
  id: string;
  slug: string;
  title: string;
  body_md: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  status: string;
  published_at: string | null;
  updated_at: string;
  source_ids: string[] | null;
  topic_id: string | null;
}

interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

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

async function getPost(slug: string): Promise<Post | null> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select(
        "id, slug, title, body_md, excerpt, cover_image_url, tags, status, published_at, updated_at, source_ids, topic_id",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return (data ?? null) as Post | null;
  } catch {
    return null;
  }
}

async function getSources(ids: string[]): Promise<SourceCitation[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_sources")
      .select("id, source_type, title, url, doi, pmid, outlet, authors, published_date")
      .in("id", ids);
    return (data ?? []) as SourceCitation[];
  } catch {
    return [];
  }
}

async function getRelated(
  topicId: string | null,
  excludeSlug: string,
): Promise<RelatedPost[]> {
  if (!topicId) return [];
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select("slug, title, excerpt, cover_image_url, published_at")
      .eq("topic_id", topicId)
      .eq("status", "published")
      .neq("slug", excludeSlug)
      .order("published_at", { ascending: false })
      .limit(3);
    return (data ?? []) as RelatedPost[];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "글을 찾을 수 없음" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      tags: post.tags ?? undefined,
      // images 는 opengraph-image.tsx file convention 이 자동 처리
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      // images 도 file convention 이 자동 fallback
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [sources, related] = await Promise.all([
    getSources(post.source_ids ?? []),
    getRelated(post.topic_id, post.slug),
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 py-10">
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← 블로그
          </Link>

          <header className="mt-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <span className="font-medium text-gray-700">{AUTHOR_NAME}</span>
              {post.published_at && (
                <>
                  <span>·</span>
                  <time dateTime={post.published_at}>
                    {new Date(post.published_at).toLocaleDateString("ko-KR")}
                  </time>
                </>
              )}
              {post.published_at &&
                post.updated_at &&
                new Date(post.updated_at).toDateString() !==
                  new Date(post.published_at).toDateString() && (
                  <span className="text-gray-400">
                    · 수정 {new Date(post.updated_at).toLocaleDateString("ko-KR")}
                  </span>
                )}
              {post.tags && post.tags.length > 0 && (
                <>
                  <span>·</span>
                  <span>{post.tags.slice(0, 5).join(" · ")}</span>
                </>
              )}
            </div>
          </header>

          {post.cover_image_url && (
            <div className="relative w-full aspect-[16/9] mb-10 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          <MedicalDisclaimer />

          <div className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-a:text-blue-700 prose-a:underline-offset-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: (props) => (
                  <a {...props} target="_blank" rel="noopener noreferrer nofollow" />
                ),
              }}
            >
              {post.body_md ?? ""}
            </ReactMarkdown>
          </div>

          {sources.length > 0 && <SourcesBox sources={sources} />}

          {related.length > 0 && <RelatedPosts posts={related} />}

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(articleSchema),
            }}
          />
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function RelatedPosts({ posts }: { posts: RelatedPost[] }) {
  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="text-xl font-bold mb-5">같은 주제의 다른 글</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group block overflow-hidden rounded-lg border bg-white hover:border-gray-400 transition-colors"
          >
            <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
              {p.cover_image_url ? (
                <Image
                  src={p.cover_image_url}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-300 text-xs">
                  헬스스캐너
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-700 line-clamp-2">
                {p.title}
              </h3>
              {p.excerpt && (
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                  {p.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MedicalDisclaimer() {
  return (
    <div className="mb-8 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 leading-relaxed">
      <strong>의료 면책</strong> · 이 글은 일반 정보 제공을 목적으로 하며, 의학적 진단·치료·처방을 대체하지 않습니다.
      개인의 건강 문제는 의료 전문가와 상담하세요.
    </div>
  );
}

function SourcesBox({ sources }: { sources: SourceCitation[] }) {
  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-lg font-semibold mb-4">출처 ({sources.length})</h2>
      <ol className="space-y-4 text-sm">
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
              rel="noopener noreferrer nofollow"
              className="text-blue-700 hover:underline"
            >
              PubMed
            </a>
            {s.doi && (
              <>
                {" · "}
                <a
                  href={`https://doi.org/${s.doi}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
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
  );
}
