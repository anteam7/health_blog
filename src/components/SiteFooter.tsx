import Link from "next/link";
import { BLOG_CATEGORIES } from "@/lib/categories";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-10">
          {/* 브랜드 */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-teal-700 text-white font-bold text-base shadow-sm">
                H
              </span>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                헬스스캐너
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-sm">
              최신 의료 논문과 신뢰할 수 있는 매체를 기반으로 건강·헬스·다이어트 정보를 정리합니다.
              모든 글에 출처를 명시하고, 사람 검토를 거친 뒤에만 발행합니다.
            </p>
            <p className="mt-4 inline-flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
              <svg
                className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                일반 정보 제공이며, 진단·치료·처방을 대체하지 않습니다.
                개인의 건강 문제는 반드시 의료 전문가와 상담하세요.
              </span>
            </p>
          </div>

          {/* 카테고리 */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              카테고리
            </h3>
            <ul className="mt-4 space-y-2.5">
              {BLOG_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/blog?category=${c.slug}`}
                    className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${c.color.solid} flex-shrink-0`}
                      aria-hidden
                    />
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 사이트 */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              사이트
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
                  전체 글
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                  문의
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 고지 */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              법적 고지
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-gray-600 hover:text-gray-900 transition-colors">
                  의료 면책 조항
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="mt-12 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} 헬스스캐너 · healthscanner.co.kr</p>
          <p>
            이미지 제공:{" "}
            <a
              href="https://unsplash.com/?utm_source=healthscanner&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 underline-offset-2 hover:underline"
            >
              Unsplash
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
