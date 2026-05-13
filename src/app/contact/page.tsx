import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PolicyHero from "@/components/PolicyHero";
import { CONTACT_GENERAL, CONTACT_PRIVACY } from "@/lib/legal";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";

export const metadata: Metadata = {
  title: "문의",
  description: "헬스스캐너에 문의·제보·정정 요청을 보내실 수 있습니다.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

const ITEMS = [
  {
    title: "일반 문의 · 제보 · 정정 요청",
    email: CONTACT_GENERAL,
    desc: "글에 사실 오류나 누락된 출처가 있다면 알려주세요. 빠르게 검토하고 수정하겠습니다.",
  },
  {
    title: "개인정보 관련 문의",
    email: CONTACT_PRIVACY,
    desc: "개인정보의 열람·정정·삭제·처리정지 요청, 개인정보처리방침 관련 문의를 받습니다.",
  },
  {
    title: "제휴 · 광고 문의",
    email: CONTACT_GENERAL,
    desc: "본 사이트는 콘텐츠의 독립성을 유지하기 위해 의약품·건강기능식품의 직접 광고나 과장된 효능을 주장하는 제휴는 받지 않습니다.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        <PolicyHero
          badge="문의"
          title="연락처"
          description="헬스스캐너에 대한 모든 문의는 이메일로 받습니다. 아래 항목 중 해당하는 연락처로 보내주세요."
        />
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          <ul className="grid gap-4">
            {ITEMS.map((it) => (
              <li
                key={it.title}
                className="rounded-xl border border-gray-200 bg-white p-6 md:p-7"
              >
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  {it.title}
                </h2>
                <p className="mt-3">
                  <a
                    href={`mailto:${it.email}`}
                    className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 font-medium"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {it.email}
                  </a>
                </p>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {it.desc}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 leading-relaxed">
            <p>
              <strong>응답 기간.</strong> 평일 기준 영업일 3일 이내 답변을
              목표로 합니다. 의료 응급 상황은 본 사이트가 아닌{" "}
              <strong>119</strong> 또는 응급실로 연락하세요.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
