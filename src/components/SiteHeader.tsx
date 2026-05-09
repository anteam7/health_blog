"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import HeaderCategoryNav from "./HeaderCategoryNav";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isBlogRoot = pathname === "/blog";

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      {/* 상단 로고 줄 */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-teal-700 text-white font-bold text-sm shadow-sm">
              H
            </span>
            <span className="font-bold text-base tracking-tight text-gray-900 group-hover:text-teal-700 transition-colors">
              헬스스캐너
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/blog"
              className={`${isBlogRoot ? "text-gray-900 font-medium" : "text-gray-600"} hover:text-gray-900 transition-colors`}
            >
              전체 글
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              소개
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              문의
            </Link>
          </nav>

          {/* 모바일 햄버거 */}
          <button
            type="button"
            aria-label="메뉴 열기"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 카테고리 nav (데스크톱) */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-4">
          <Suspense fallback={<div className="h-10" aria-hidden />}>
            <HeaderCategoryNav variant="desktop" />
          </Suspense>
        </div>
      </div>

      {/* 모바일 드로어 */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
            <Suspense fallback={<div className="h-10" aria-hidden />}>
              <HeaderCategoryNav variant="mobile" />
            </Suspense>
            <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-2 text-sm">
              <Link
                href="/blog"
                className="rounded-md border border-gray-200 px-3 py-2 text-center text-gray-700 hover:bg-gray-50"
              >
                전체 글
              </Link>
              <Link
                href="/about"
                className="rounded-md border border-gray-200 px-3 py-2 text-center text-gray-700 hover:bg-gray-50"
              >
                소개
              </Link>
              <Link
                href="/contact"
                className="rounded-md border border-gray-200 px-3 py-2 text-center text-gray-700 hover:bg-gray-50"
              >
                문의
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
