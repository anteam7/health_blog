import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/auth/admin-supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";

// 콘텐츠가 늘어나면 빌드 시 매번 모두 가져오는 게 비싸짐 — 1시간 캐시
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // 발행된 콘텐츠 동적 포함
  let contentEntries: MetadataRoute.Sitemap = [];
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5000);
    contentEntries = (data ?? []).map((row) => ({
      url: `${SITE_URL}/blog/${row.slug}`,
      lastModified: new Date(row.updated_at ?? row.published_at ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // 빌드 환경에서 service_role 키가 없으면 스킵
  }

  return [...staticEntries, ...contentEntries];
}
