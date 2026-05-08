"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "../LogoutButton";

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/topics", label: "토픽" },
  { href: "/admin/contents", label: "콘텐츠" },
  { href: "/admin/sources", label: "자료 수집" },
];

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 shrink-0 border-r bg-white transform transition-transform duration-200 ease-out md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-5 border-b flex items-center justify-between">
          <Link href="/admin" className="font-semibold">
            health_blog
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="md:hidden p-1 -mr-1 text-gray-500 hover:text-gray-900"
            aria-label="메뉴 닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="px-4 pt-2 text-xs text-gray-500">관리자</p>
        <nav className="p-2 space-y-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 text-gray-700"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-white flex items-center justify-between gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md:hidden p-2 -ml-2 text-gray-700 hover:text-gray-900"
            aria-label="메뉴 열기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-3 ml-auto min-w-0">
            <span className="text-sm text-gray-600 truncate max-w-[40vw] md:max-w-none">
              {userEmail}
            </span>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
