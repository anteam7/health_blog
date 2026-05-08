import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 600; // 10분

interface RecentPost {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
}

async function getRecentPosts(): Promise<RecentPost[]> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select("slug, title, excerpt, cover_image_url, tags, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6);
    return (data ?? []) as RecentPost[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getRecentPosts();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              건강 정보, <span className="text-blue-600">근거</span>로 읽다
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-2xl leading-relaxed">
              최신 의료 논문과 신뢰할 만한 자료를 기초로 건강·헬스·다이어트 정보를 정리합니다.
              모든 글에 출처를 명시하고, 검증된 사실만 전합니다.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/blog"
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
              >
                블로그 보기
              </Link>
              <Link
                href="/about"
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                사이트 소개
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-semibold">최신 글</h2>
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
              전체 보기 →
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-md border border-dashed bg-white p-10 text-center text-sm text-gray-500">
              아직 발행된 글이 없습니다. 곧 첫 콘텐츠를 게시할 예정입니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

function PostCard({ post }: { post: RecentPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-lg border bg-white hover:border-gray-400 transition-colors"
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-300 text-sm">
            헬스스캐너
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg leading-snug group-hover:text-blue-700 line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          {post.published_at && (
            <span>{new Date(post.published_at).toLocaleDateString("ko-KR")}</span>
          )}
          {post.tags && post.tags.length > 0 && (
            <>
              <span>·</span>
              <span className="truncate">{post.tags.slice(0, 3).join(" · ")}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
