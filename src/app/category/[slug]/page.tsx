import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  BLOG_CATEGORIES,
  isBlogCategorySlug,
  getCategory,
} from "@/lib/categories";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";

export const revalidate = 600;

interface PostListItem {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  category: string | null;
  evidence_level: string | null;
}

// 5개 카테고리 모두 정적 prerender
export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategory(slug);
  if (!c) return { title: "카테고리" };
  return {
    title: `${c.label} | 블로그`,
    description: `${c.label} — ${c.description}`,
    alternates: {
      canonical: `${SITE_URL}/category/${c.slug}`,
    },
  };
}

async function getCategoryPosts(slug: string): Promise<PostListItem[]> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select(
        "slug, title, excerpt, cover_image_url, tags, published_at, category, evidence_level",
      )
      .eq("status", "published")
      .eq("category", slug)
      .order("published_at", { ascending: false })
      .limit(200);
    return (data ?? []) as PostListItem[];
  } catch {
    return [];
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isBlogCategorySlug(slug)) notFound();
  const cat = getCategory(slug);
  if (!cat) notFound();

  const posts = await getCategoryPosts(slug);

  // CollectionPage JSON-LD
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/category/${cat.slug}`,
    name: cat.label,
    description: cat.description,
    url: `${SITE_URL}/category/${cat.slug}`,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    numberOfItems: posts.length,
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        <section className={`border-b border-gray-200 ${cat.color.bg}`}>
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span
                    className={`h-2 w-2 rounded-full ${cat.color.solid}`}
                    aria-hidden
                  />
                  Category
                </div>
                <h1
                  className={`mt-2 text-3xl md:text-4xl font-bold tracking-tight ${cat.color.text}`}
                >
                  {cat.label}
                </h1>
                <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900 text-2xl">
                  {posts.length}
                </span>
                <span className="ml-1.5">편</span>
              </div>
            </div>

            <nav aria-label="다른 카테고리" className="mt-7 flex flex-wrap gap-2">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
              >
                전체 글
              </Link>
              {BLOG_CATEGORIES.map((c) => {
                const isActive = c.slug === cat.slug;
                return (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? `${c.color.solid} text-white`
                        : `${c.color.bg} ${c.color.text} ${c.color.hover}`
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-white/80" : c.color.solid
                      }`}
                      aria-hidden
                    />
                    {c.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
              {cat.label} 카테고리에 아직 발행된 글이 없습니다.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {posts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </main>
      <SiteFooter />
    </>
  );
}

function PostCard({ post }: { post: PostListItem }) {
  const cat = getCategory(post.category);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-100 text-teal-300">
            <span className="text-2xl font-bold tracking-tight">헬스스캐너</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        {cat && (
          <span
            className={`inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cat.color.bg} ${cat.color.text}`}
          >
            <span
              className={`h-1 w-1 rounded-full ${cat.color.solid}`}
              aria-hidden
            />
            {cat.label}
          </span>
        )}
        <h2 className="mt-2.5 font-semibold text-base md:text-lg leading-snug text-gray-900 group-hover:text-teal-700 line-clamp-2 transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-4 flex items-center gap-2 text-[11px] text-gray-500">
          {post.published_at && (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {post.evidence_level && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-teal-600"
                  aria-hidden
                />
                {evidenceLabelKr(post.evidence_level)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function evidenceLabelKr(level: string): string {
  switch (level) {
    case "meta":
      return "메타분석";
    case "rct":
      return "RCT";
    case "guideline":
      return "가이드라인";
    case "review":
      return "리뷰 논문";
    case "news":
      return "보도";
    default:
      return level;
  }
}
