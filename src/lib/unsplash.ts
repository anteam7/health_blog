// Unsplash API helper — 어드민 cover 검색·트래킹 전용 (서버 사이드만).
// Demo mode 시간당 50 req. Production 승격하면 5,000 req.
//
// API 가이드라인 의무:
// - 사용자가 사진 "선택"하는 시점에 photo.links.download_location 을 GET 호출 (트래킹).
//   호출 결과의 url 필드는 무시 가능 — 카운트만 올리면 됨.
// - photographer + Unsplash 링크 표시 권장. 우리는 사이트 footer 에서 일괄 처리.

const ENDPOINT = "https://api.unsplash.com";

export interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  width: number;
  height: number;
  color: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string; // ~1080px wide
    small: string; // ~400px wide
    thumb: string; // ~200px wide
  };
  links: {
    html: string;
    download_location: string; // 트래킹용 — 선택 시 GET 호출
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

function getAccessKey(): string {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    throw new Error("UNSPLASH_ACCESS_KEY missing");
  }
  return key;
}

export async function searchPhotos(
  query: string,
  opts?: { page?: number; perPage?: number; orientation?: "landscape" | "portrait" | "squarish" },
): Promise<UnsplashSearchResult> {
  const params = new URLSearchParams({
    query,
    page: String(opts?.page ?? 1),
    per_page: String(opts?.perPage ?? 12),
    orientation: opts?.orientation ?? "landscape",
    content_filter: "high",
  });
  const res = await fetch(`${ENDPOINT}/search/photos?${params.toString()}`, {
    headers: {
      Authorization: `Client-ID ${getAccessKey()}`,
      "Accept-Version": "v1",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`unsplash_search_failed_${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as UnsplashSearchResult;
}

// Unsplash API 가이드라인 준수: 사용자가 사진을 "사용 결정" 한 시점에 호출.
// 트래킹 카운트만 올리면 되므로 응답 본문은 무시.
export async function trackDownload(downloadLocation: string): Promise<void> {
  // 안전 — Unsplash 도메인 외 URL 은 거부
  if (!downloadLocation.startsWith("https://api.unsplash.com/")) {
    return;
  }
  try {
    await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${getAccessKey()}`,
      },
      cache: "no-store",
    });
  } catch {
    // best-effort — 트래킹 실패해도 cover 지정은 진행
  }
}

// 본문 cover_image_url 에 저장할 URL — Unsplash CDN 직접 host.
// regular(1080px) 면 hero 용으로 충분. ?w=&q= 으로 사이즈/품질 조정 가능.
export function buildCoverUrl(photo: UnsplashPhoto, width = 1600): string {
  // raw URL + 파라미터로 반응형. q=80 충분.
  const u = new URL(photo.urls.raw);
  u.searchParams.set("w", String(width));
  u.searchParams.set("q", "80");
  u.searchParams.set("fm", "jpg");
  u.searchParams.set("fit", "crop");
  return u.toString();
}
