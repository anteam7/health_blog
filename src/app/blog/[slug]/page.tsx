import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs, {
  buildBreadcrumbJsonLd,
  type BreadcrumbItem,
} from "@/components/blog/Breadcrumbs";
import AuthorMeta, {
  estimateReadingMinutes,
} from "@/components/blog/AuthorMeta";
import AuthorBox from "@/components/blog/AuthorBox";
import Toc from "@/components/blog/Toc";
import ShareButtons from "@/components/blog/ShareButtons";
import {
  extractToc,
  extractText,
  slugifyHeading,
} from "@/lib/blog-toc";
import { getCategory, getCategoryLabel, evidenceLabel } from "@/lib/categories";
import AdSlot from "@/components/ads/AdSlot";

const ARTICLE_INLINE_SLOT =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE;
const ARTICLE_FOOTER_SLOT =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_FOOTER;

export const revalidate = 600;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";
const SITE_NAME = "헬스스캐너";
const FALLBACK_AUTHOR = "헬스스캐너 편집부";

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
  category: string | null;
  author_name: string | null;
  author_credential: string | null;
  reviewer_name: string | null;
  reviewer_credential: string | null;
  reviewed_at: string | null;
  evidence_level: string | null;
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
        "id, slug, title, body_md, excerpt, cover_image_url, tags, status, published_at, updated_at, source_ids, topic_id, category, author_name, author_credential, reviewer_name, reviewer_credential, reviewed_at, evidence_level",
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

  const tocItems = extractToc(post.body_md);
  const readingMinutes = estimateReadingMinutes(post.body_md);
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const categoryLabel = post.category
    ? getCategoryLabel(post.category)
    : null;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "홈", href: "/" },
    { label: "블로그", href: "/blog" },
  ];
  if (post.category && categoryLabel) {
    breadcrumbItems.push({
      label: categoryLabel,
      href: `/blog?category=${post.category}`,
    });
  }
  breadcrumbItems.push({ label: post.title });

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author_name ?? FALLBACK_AUTHOR,
      ...(post.author_credential
        ? { jobTitle: post.author_credential }
        : {}),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    ...(post.reviewer_name
      ? {
          reviewedBy: {
            "@type": "Person",
            name: post.reviewer_name,
            ...(post.reviewer_credential
              ? { jobTitle: post.reviewer_credential }
              : {}),
          },
        }
      : {}),
    ...(post.reviewed_at ? { lastReviewed: post.reviewed_at } : {}),
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Patient",
    },
    inLanguage: "ko-KR",
  };

  const breadcrumbSchema = buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL);

  // ReactMarkdown h2/h3 id 부여 — extractToc 와 동일 알고리즘으로
  // 같은 순서·같은 카운터를 굴려야 앵커가 일치한다.
  const seen = new Map<string, number>();
  function makeHeadingId(text: string): string {
    const baseId = slugifyHeading(text);
    if (!baseId) return "";
    const c = seen.get(baseId) ?? 0;
    seen.set(baseId, c + 1);
    return c === 0 ? baseId : `${baseId}-${c + 1}`;
  }

  // 본문 H2 두 번째 직전에 In-article AdSlot 삽입. 첫 H2 위는 LCP 영향 + 도입부 흐름 끊김으로 회피.
  let h2Index = 0;

  const cat = getCategory(post.category);
  const evLabel = post.evidence_level
    ? evidenceLabel(post.evidence_level)
    : null;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-10 pb-6">
            <Breadcrumbs items={breadcrumbItems} />

            {/* 카테고리 + 근거 등급 */}
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {cat && (
                <Link
                  href={`/blog?category=${post.category}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${cat.color.bg} ${cat.color.text} ${cat.color.hover} transition-colors`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${cat.color.solid}`}
                    aria-hidden
                  />
                  {cat.label}
                </Link>
              )}
              {evLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  <ShieldCheckIcon />
                  근거 {evLabel}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 text-base md:text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* byline */}
            <div className="mt-7 flex items-center gap-3 pt-5 border-t border-gray-100">
              <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-700 text-white font-bold text-sm">
                H
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {post.author_name ?? FALLBACK_AUTHOR}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  <span>·</span>
                  <span>약 {readingMinutes}분 읽기</span>
                  {post.reviewed_at && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-teal-700">
                        <ShieldCheckIcon className="h-3 w-3" />
                        {new Date(post.reviewed_at).toLocaleDateString(
                          "ko-KR",
                        )}{" "}
                        검토
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cover image — full bleed within hero */}
          {post.cover_image_url && (
            <div className="max-w-6xl mx-auto px-0 md:px-4 pb-8">
              <div className="relative w-full aspect-[16/9] overflow-hidden md:rounded-2xl bg-gray-100 shadow-sm">
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </section>

        {/* Body — grid (lg에서 본문 + 사이드 sticky) */}
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {/* 좌측 본문 */}
            <article className="lg:col-span-8 min-w-0">
              <MedicalDisclaimer />

              {/* 모바일 inline TOC */}
              <div className="lg:hidden">
                <Toc items={tocItems} variant="inline" />
              </div>

              <div className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-a:text-teal-700 prose-a:underline-offset-2 prose-headings:scroll-mt-24 prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:text-lg md:prose-h3:text-xl prose-p:leading-relaxed prose-li:leading-relaxed prose-img:rounded-lg">
                <ReactMarkdown
                  remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                  components={{
                    h2: ({ children }) => {
                      h2Index += 1;
                      const heading = (
                        <h2 id={makeHeadingId(extractText(children))}>
                          {children}
                        </h2>
                      );
                      if (h2Index === 2) {
                        return (
                          <>
                            <AdSlot
                              slot={ARTICLE_INLINE_SLOT}
                              debugLabel="article-inline (H2 #2)"
                            />
                            {heading}
                          </>
                        );
                      }
                      return heading;
                    },
                    h3: ({ children }) => (
                      <h3 id={makeHeadingId(extractText(children))}>
                        {children}
                      </h3>
                    ),
                    a: (props) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      />
                    ),
                  }}
                >
                  {post.body_md ?? ""}
                </ReactMarkdown>
              </div>

              {sources.length > 0 && <SourcesBox sources={sources} />}

              <AdSlot
                slot={ARTICLE_FOOTER_SLOT}
                debugLabel="article-footer"
              />

              <ShareButtons
                url={postUrl}
                title={post.title}
                description={post.excerpt ?? undefined}
                imageUrl={post.cover_image_url ?? undefined}
              />

              <AuthorBox
                authorName={post.author_name}
                authorCredential={post.author_credential}
                reviewerName={post.reviewer_name}
                reviewerCredential={post.reviewer_credential}
                reviewedAt={post.reviewed_at}
              />
            </article>

            {/* 우측 sticky sidebar */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <Toc items={tocItems} variant="sidebar" />
              </div>
            </aside>
          </div>

          {/* Related posts (full width) */}
          {related.length > 0 && (
            <div className="mt-16 lg:mt-20">
              <RelatedPosts posts={related} />
            </div>
          )}

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(blogPostingSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(breadcrumbSchema),
            }}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ShieldCheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 1.944A11.954 11.954 0 012.166 5C2.057 5.65 2 6.318 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zm3.707 7.05a1 1 0 00-1.414-1.414L9 10.872 7.707 9.58a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
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
              {s.source_type === "paper" ? "PubMed" : "원문"}
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
