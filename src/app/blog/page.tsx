import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { Metadata } from "next";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "블로그",
  description: "헬스스캐너의 모든 글 — 논문과 뉴스를 근거로 한 건강 정보",
};

interface PostListItem {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
}

async function getAllPublished(): Promise<PostListItem[]> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select("slug, title, excerpt, cover_image_url, tags, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(200);
    return (data ?? []) as PostListItem[];
  } catch {
    return [];
  }
}

export default async function BlogIndexPage() {
  const posts = await getAllPublished();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">블로그</h1>
            <p className="mt-2 text-gray-600">
              모든 글에는 논문·뉴스 출처를 명시합니다.
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="rounded-md border border-dashed bg-white p-10 text-center text-sm text-gray-500">
              아직 발행된 글이 없습니다.
            </div>
          ) : (
            <ul className="space-y-6">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex gap-4 sm:gap-6 rounded-lg p-3 sm:p-4 -mx-3 sm:-mx-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative shrink-0 w-32 sm:w-44 aspect-[16/9] overflow-hidden rounded-md bg-gray-100">
                      {p.cover_image_url ? (
                        <Image
                          src={p.cover_image_url}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 128px, 176px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-300 text-xs">
                          헬스스캐너
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold leading-snug group-hover:text-blue-700 line-clamp-2">
                        {p.title}
                      </h2>
                      {p.excerpt && (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {p.excerpt}
                        </p>
                      )}
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                        {p.published_at && (
                          <time dateTime={p.published_at}>
                            {new Date(p.published_at).toLocaleDateString("ko-KR")}
                          </time>
                        )}
                        {p.tags && p.tags.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="truncate">
                              {p.tags.slice(0, 3).join(" · ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
