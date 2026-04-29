import Link from "next/link";
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
  tags: string[] | null;
  published_at: string | null;
}

async function getAllPublished(): Promise<PostListItem[]> {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select("slug, title, excerpt, tags, published_at")
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
            <ul className="divide-y border-t">
              {posts.map((p) => (
                <li key={p.slug} className="py-6">
                  <Link href={`/blog/${p.slug}`} className="group block">
                    <h2 className="text-xl font-semibold leading-snug group-hover:text-blue-700">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                      {p.published_at && (
                        <time dateTime={p.published_at}>
                          {new Date(p.published_at).toLocaleDateString("ko-KR")}
                        </time>
                      )}
                      {p.tags && p.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{p.tags.slice(0, 4).join(" · ")}</span>
                        </>
                      )}
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
