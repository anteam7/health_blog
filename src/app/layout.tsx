import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "헬스스캐너 — 논문·뉴스 근거 건강 정보",
    template: "%s | 헬스스캐너",
  },
  description:
    "최신 논문과 뉴스를 근거로 정리한 건강·헬스·다이어트 가이드. 출처를 검증한 정보만 제공합니다.",
  openGraph: {
    type: "website",
    siteName: "헬스스캐너",
    locale: "ko_KR",
    url: SITE_URL,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
