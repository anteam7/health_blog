"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog-toc";

interface Props {
  items: TocItem[];
  variant?: "inline" | "sidebar";
}

// 글 상단 inline 목차 또는 lg 사이드 sticky 목차.
// 헤딩 3개 미만이면 비표시.
export default function Toc({ items, variant = "inline" }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (variant !== "sidebar" || items.length === 0) return;
    const observers: IntersectionObserver[] = [];
    const byId = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) byId.set(e.target.id, e);
        // 화면 상단에서 보이는 가장 위쪽 항목을 active로
        const visible = [...byId.values()]
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0% -60% 0%", threshold: 0.1 },
    );
    observers.push(observer);

    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [items, variant]);

  if (items.length < 3) return null;

  if (variant === "sidebar") {
    return (
      <nav aria-label="목차" className="text-sm">
        <p className="text-[11px] font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          이 글의 목차
        </p>
        <ol className="space-y-2 border-l border-gray-200">
          {items.map((it) => {
            const isActive = activeId === it.id;
            return (
              <li
                key={it.id}
                className={it.level === 3 ? "ml-4" : ""}
              >
                <a
                  href={`#${it.id}`}
                  className={`block -ml-px border-l-2 pl-3 py-1 leading-snug transition-colors ${
                    isActive
                      ? "border-teal-600 text-teal-700 font-medium"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {it.text}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // inline (모바일·기본)
  return (
    <nav
      aria-label="목차"
      className="mb-8 rounded-xl border border-gray-200 bg-white p-5"
    >
      <p className="text-[11px] font-semibold text-gray-500 mb-3 uppercase tracking-wider">
        이 글의 목차
      </p>
      <ol className="space-y-1.5 text-sm">
        {items.map((it) => (
          <li key={it.id} className={it.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${it.id}`}
              className="text-gray-700 hover:text-teal-700 hover:underline underline-offset-4 leading-snug"
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
