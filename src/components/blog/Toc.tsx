import type { TocItem } from "@/lib/blog-toc";

// 글 상단 inline 목차. 헤딩 3개 미만이면 비표시.
// 사이드 sticky 는 max-w-3xl 제약 때문에 후속 사이클(레이아웃 재구성 동반).
export default function Toc({ items }: { items: TocItem[] }) {
  if (items.length < 3) return null;

  return (
    <nav
      aria-label="목차"
      className="mb-10 rounded-lg border bg-gray-50/60 p-4"
    >
      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        목차
      </p>
      <ol className="space-y-1.5 text-sm">
        {items.map((it) => (
          <li
            key={it.id}
            className={it.level === 3 ? "ml-4" : ""}
          >
            <a
              href={`#${it.id}`}
              className="text-gray-700 hover:text-blue-700 hover:underline underline-offset-4 leading-snug"
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
