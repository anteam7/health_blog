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
        "id, slug, title, body_md, excerpt, cover_image_url, tags, status, published_at, updated_at, source_ids",
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
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, width: 1600, height: 900 }]
        : undefined,
    },
    twitter: {
      card: post.cover_image_url ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
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

  const sources = await getSources(post.source_ids ?? []);

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
            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
              {post.published_at && (
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("ko-KR")}
                </time>
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
        </article>
      </main>
      <SiteFooter />
    </>
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
