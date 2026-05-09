import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string; // 마지막 항목(현재 페이지)은 href 없음
}

// 단일 진실: BlogPostPage 에서 만든 trail 을 받아 시각/JSON-LD 양쪽에 전달.
export default function Breadcrumbs({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  return (
    <nav
      aria-label="breadcrumb"
      className="text-xs text-gray-500 flex items-center flex-wrap gap-x-1.5 gap-y-1"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-gray-900 underline-offset-4 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700 line-clamp-1 max-w-[24ch] sm:max-w-[40ch]">
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-gray-300">›</span>}
          </span>
        );
      })}
    </nav>
  );
}

// BreadcrumbList JSON-LD 객체 빌더 (BlogPostPage 에서 직렬화)
export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[],
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };
}
