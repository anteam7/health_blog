import { createAdminClient } from "@/lib/auth/admin-supabase";
import { getCategoryLabel } from "@/lib/categories";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";
const SITE_NAME = "헬스스캐너";
const SITE_DESC =
  "최신 의료 논문과 신뢰할 수 있는 매체를 기반으로 건강·헬스·다이어트 정보를 정리합니다. 모든 글에 출처를 명시하고, 사람 검토를 거친 뒤에만 발행합니다.";

export const revalidate = 1800; // 30분 캐시

interface FeedPost {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string;
  category: string | null;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: string | null): string {
  return new Date(date ?? Date.now()).toUTCString();
}

export async function GET() {
  let posts: FeedPost[] = [];
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select("slug, title, excerpt, published_at, updated_at, category")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);
    posts = (data ?? []) as FeedPost[];
  } catch {
    // 환경변수 미설정 등으로 실패 시 빈 피드
  }

  const lastBuildDate =
    posts.length > 0
      ? rfc822(posts[0].updated_at ?? posts[0].published_at)
      : new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const categoryLabel = p.category ? getCategoryLabel(p.category) : null;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(p.published_at)}</pubDate>
${
  p.excerpt
    ? `      <description>${escapeXml(p.excerpt)}</description>\n`
    : ""
}${
        categoryLabel
          ? `      <category>${escapeXml(categoryLabel)}</category>\n`
          : ""
      }    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESC)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Next.js</generator>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
