import Link from "next/link";
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
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 border-r bg-white">
        <div className="px-4 py-5 border-b">
          <Link href="/admin" className="font-semibold">
            health_blog
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">관리자</p>
        </div>
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
        <header className="h-14 border-b bg-white flex items-center justify-end gap-3 px-6">
          <span className="text-sm text-gray-600">{userEmail}</span>
          <LogoutButton />
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
