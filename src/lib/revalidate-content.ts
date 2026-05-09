import { revalidatePath } from "next/cache";

/**
 * 글 1편의 변경(생성/수정/표지/발행/원복)이 영향을 주는 모든 ISR 경로를 한 번에 무효화한다.
 * 표지 이미지처럼 홈·카테고리 카드까지 박혀 있는 필드가 stale 로 남는 사고 재발 방지.
 */
export function revalidateContentPaths(opts: {
  slug?: string | null;
  category?: string | null;
}) {
  try {
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");
    if (opts.slug) revalidatePath(`/blog/${opts.slug}`);
    if (opts.category) revalidatePath(`/category/${opts.category}`);
  } catch {
    // best-effort
  }
}
