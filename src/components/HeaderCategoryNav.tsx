"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BLOG_CATEGORIES } from "@/lib/categories";

interface Props {
  /** 모바일 드로어 안에서 사용할 때 다른 레이아웃 적용 */
  variant?: "desktop" | "mobile";
}

export default function HeaderCategoryNav({ variant = "desktop" }: Props) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  if (variant === "mobile") {
    return (
      <div className="flex flex-wrap gap-2">
        {BLOG_CATEGORIES.map((c) => {
          const isActive = activeCategory === c.slug;
          return (
            <Link
              key={c.slug}
              href={`/blog?category=${c.slug}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                isActive
                  ? `${c.color.solid} text-white`
                  : `${c.color.bg} ${c.color.text}`
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-white/80" : c.color.solid
                }`}
                aria-hidden
              />
              {c.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1 overflow-x-auto py-2 -mx-1 px-1">
      {BLOG_CATEGORIES.map((c) => {
        const isActive = activeCategory === c.slug;
        return (
          <Link
            key={c.slug}
            href={`/blog?category=${c.slug}`}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? `${c.color.solid} text-white`
                : `${c.color.bg} ${c.color.text} ${c.color.hover}`
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isActive ? "bg-white/80" : c.color.solid
              }`}
              aria-hidden
            />
            {c.label}
          </Link>
        );
      })}
    </nav>
  );
}
