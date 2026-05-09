import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BLOG_CATEGORIES, getCategory } from "@/lib/categories";

export const revalidate = 600; // 10분

interface RecentPost {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  category: string | null;
  evidence_level: string | null;
}

async function getRecentPosts(limit: number): Promise<RecentPost[]> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select(
        "slug, title, excerpt, cover_image_url, tags, published_at, category, evidence_level"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as RecentPost[];
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

export default async function HomePage() {
  const [posts, counts] = await Promise.all([
    getRecentPosts(7),
    getCategoryCounts(),
  ]);
  const featured = posts[0];
  const rest = posts.slice(1, 7);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-200">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-600" />
                  논문·뉴스 근거 건강 블로그
                </div>
                <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                  건강 정보,{" "}
                  <span className="text-teal-700">근거</span>로 읽다
                </h1>
                <p className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                  최신 의료 논문과 신뢰 매체 보도를 한국어 독자가 이해하기 쉽게 정리합니다.
                  모든 글에 출처를 명시하고, 사람 검토를 거친 뒤에만 발행합니다.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/blog"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-teal-700 px-6 text-sm font-semibold text-white hover:bg-teal-800 transition-colors shadow-sm"
                  >
                    최신 글 보기
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex h-11 items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    검증 절차 알아보기
                  </Link>
                </div>
              </div>
              <div className="md:col-span-5">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                    Editorial Standards
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span>
                        <span className="font-semibold">PubMed 검증</span>: 모든 인용 논문의 PMID·DOI 직접 확인
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span>
                        <span className="font-semibold">사람 검토</span>: 발행 전 출처·과장·면책 항목 점검
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span>
                        <span className="font-semibold">분기 재검토</span>: 새 근거 출현 시 즉시 갱신
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 카테고리 탐색 */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              주제별 탐색
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {BLOG_CATEGORIES.map((c) => {
                const count = counts[c.slug] ?? 0;
                return (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className={`group rounded-xl border ${c.color.border} ${c.color.bg} ${c.color.hover} p-4 transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${c.color.solid} text-white text-xs font-bold`}
                      >
                        {c.label.charAt(0)}
                      </span>
                      <span className={`text-xs ${c.color.text} font-medium`}>
                        {count}편
                      </span>
                    </div>
                    <p className={`mt-3 font-semibold ${c.color.text}`}>
                      {c.label}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500 line-clamp-2 leading-tight">
                      {c.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured + Recent */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">최신 글</h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              전체 보기 →
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
              아직 발행된 글이 없습니다. 곧 첫 콘텐츠를 게시할 예정입니다.
            </div>
          ) : (
            <div className="space-y-7">
              {/* Featured — 가로형 hero */}
              {featured && <FeaturedHero post={featured} />}

              {/* Recent — 3열 그리드 */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {rest.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 신뢰 배지 / About 인트로 */}
        <section className="bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <div className="grid md:grid-cols-3 gap-8">
              <TrustItem
                title="검증된 출처"
                desc="모든 글은 PubMed 학술 논문 또는 권위 매체 보도를 출처로 인용합니다. 환각 인용을 막기 위해 PMID·DOI·발행일까지 직접 검증합니다."
                icon={<DocIcon />}
              />
              <TrustItem
                title="사람 검토 + 정기 갱신"
                desc="AI 도움을 받아 초안을 작성하더라도 사람이 출처·과장·의학적 면책을 점검한 뒤에만 발행합니다. 분기 1회 정기 재검토를 진행합니다."
                icon={<EyeIcon />}
              />
              <TrustItem
                title="의료 행위 비대체"
                desc="모든 콘텐츠는 일반 정보 제공 목적이며, 진단·치료·처방을 대체하지 않습니다. 개인의 건강 문제는 반드시 전문가와 상담하세요."
                icon={<ShieldIcon />}
              />
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/about"
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                콘텐츠 검증 4단계 자세히 보기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function FeaturedHero({ post }: { post: RecentPost }) {
  const cat = getCategory(post.category);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col md:flex-row overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
    >
      <div className="relative md:w-7/12 aspect-[16/9] md:aspect-auto bg-gray-100 overflow-hidden md:min-h-[360px]">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
        ) : (
          <CoverFallback />
        )}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-600 backdrop-blur shadow-sm">
          Featured
        </div>
      </div>
      <div className="flex flex-col flex-1 p-6 md:p-8 md:w-5/12">
        {cat && <CategoryBadge category={cat} />}
        <h3 className="mt-3 font-bold text-2xl md:text-3xl leading-tight text-gray-900 group-hover:text-teal-700 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed line-clamp-5 md:line-clamp-none">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-5 flex items-center gap-4">
          <PostMeta post={post} compact />
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-teal-700 group-hover:gap-2 transition-all">
            전체 글 읽기
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: RecentPost }) {
  const cat = getCategory(post.category);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <CoverFallback />
        )}
      </div>
      <div className="p-4">
        {cat && <CategoryBadge category={cat} />}
        <h3 className="mt-2 font-semibold text-base leading-snug text-gray-900 group-hover:text-teal-700 line-clamp-2 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 text-xs text-gray-600 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <PostMeta post={post} compact />
      </div>
    </Link>
  );
}

function CategoryBadge({
  category,
}: {
  category: NonNullable<ReturnType<typeof getCategory>>;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${category.color.bg} ${category.color.text}`}
    >
      <span
        className={`h-1 w-1 rounded-full ${category.color.solid}`}
        aria-hidden
      />
      {category.label}
    </span>
  );
}

function PostMeta({ post, compact = false }: { post: RecentPost; compact?: boolean }) {
  return (
    <div
      className={`mt-${compact ? "2" : "4"} flex items-center gap-2 text-[11px] text-gray-500`}
    >
      {post.published_at && (
        <span>
          {new Date(post.published_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      )}
      {post.evidence_level && (
        <>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden />
            {evidenceLabelKr(post.evidence_level)}
          </span>
        </>
      )}
    </div>
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

function CoverFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-100 text-teal-300">
      <span className="text-2xl font-bold tracking-tight">헬스스캐너</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-700"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrustItem({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
