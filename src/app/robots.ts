import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";

// disallow 경로 — 어드민/내부 API/Next 자산
const DISALLOW = ["/admin", "/admin/", "/api/", "/_next/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 기본 — 모든 봇
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      // 한국 검색엔진 (네이버)
      { userAgent: "Yeti", allow: "/", disallow: DISALLOW },
      // 빙
      { userAgent: "bingbot", allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
