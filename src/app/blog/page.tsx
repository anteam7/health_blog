import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  BLOG_CATEGORIES,
  isBlogCategorySlug,
  getCategory,
} from "@/lib/categories";
import type { Metadata } from "next";

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

interface SearchParams {
  category?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const cat =
    sp.category && isBlogCategorySlug(sp.category) ? sp.category : null;
  const c = cat ? getCategory(cat) : null;
  return {
    title: c ? `${c.label} | 블로그` : "블로그",
    description: c
      ? `${c.label} 카테고리 글 — 논문과 뉴스를 근거로 한 건강 정보`
      : "헬스스캐너의 모든 글 — 논문과 뉴스를 근거로 한 건강 정보",
  };
}

async function getAllPublished(
  category: string | null,
): Promise<PostListItem[]> {
  try {
    const sb = createAdminClient();
    let q = sb
      .from("health_contents")
      .select(
        "slug, title, excerpt, cover_image_url, tags, published_at, category, evidence_level",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(200);
    if (category) q = q.eq("category", category);
    const { data } = await q;
    return (data ?? []) as PostListItem[];
  } catch {
    return [];
  }
}

async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select("category")
      .eq("status", "published");
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const k = (row as { category: string | null }).category;
      if (k) counts[k] = (counts[k] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const activeSlug =
    sp.category && isBlogCategorySlug(sp.category) ? sp.category : null;
  const [posts, counts] = await Promise.all([
    getAllPublished(activeSlug),
    getCategoryCounts(),
  ]);
  const activeCat = activeSlug ? getCategory(activeSlug) : null;
  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        {/* 페이지 헤더 — 카테고리별 컬러 배너 */}
        <section
          className={`border-b border-gray-200 ${
            activeCat ? activeCat.color.bg : "bg-white"
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {activeCat ? (
                    <>
                      <span
                        className={`h-2 w-2 rounded-full ${activeCat.color.solid}`}
                        aria-hidden
                      />
                      Category
                    </>
                  ) : (
                    "All Articles"
                  )}
                </div>
                <h1
                  className={`mt-2 text-3xl md:text-4xl font-bold tracking-tight ${
                    activeCat ? activeCat.color.text : "text-gray-900"
                  }`}
                >
                  {activeCat ? activeCat.label : "전체 글"}
                </h1>
                <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
                  {activeCat
                    ? activeCat.description
                    : "최신 의료 논문과 신뢰 매체 보도를 한국어 독자가 이해하기 쉽게 정리합니다. 모든 글에 출처를 명시하고, 사람 검토를 거친 뒤에만 발행합니다."}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900 text-2xl">
                  {posts.length}
                </span>
                <span className="ml-1.5">편</span>
              </div>
            </div>

            {/* 페이지 안 카테고리 필터 (헤더 nav 보조) */}
            <nav
              aria-label="카테고리 필터"
              className="mt-7 flex flex-wrap gap-2"
            >
              <FilterChip
                href="/blog"
                label="전체"
                count={totalAll}
                active={activeSlug === null}
              />
              {BLOG_CATEGORIES.map((c) => (
                <FilterChip
                  key={c.slug}
                  href={`/blog?category=${c.slug}`}
                  label={c.label}
                  count={counts[c.slug] ?? 0}
                  active={activeSlug === c.slug}
                  color={c.color}
                />
              ))}
            </nav>
          </div>
        </section>

        {/* 글 그리드 */}
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
              {activeCat
                ? `${activeCat.label} 카테고리에 아직 발행된 글이 없습니다.`
                : "아직 발행된 글이 없습니다."}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {posts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function FilterChip({
  href,
  label,
  count,
  active,
  color,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  color?: (typeof BLOG_CATEGORIES)[number]["color"];
}) {
  if (active) {
    return (
      <Link
        href={href}
        aria-current="page"
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm ${
          color?.solid ?? "bg-gray-900"
        }`}
      >
        {label}
        <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
          {count}
        </span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
    >
      {color && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${color.solid}`}
          aria-hidden
        />
      )}
      {label}
      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
        {count}
      </span>
    </Link>
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
