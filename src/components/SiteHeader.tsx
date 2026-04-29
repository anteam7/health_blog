import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          헬스스캐너
        </Link>
        <nav className="flex items-center gap-5 text-sm text-gray-600">
          <Link href="/blog" className="hover:text-gray-900">블로그</Link>
          <Link href="/about" className="hover:text-gray-900">소개</Link>
        </nav>
      </div>
    </header>
  );
}
