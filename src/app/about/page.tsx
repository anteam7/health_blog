import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PolicyHero from "@/components/PolicyHero";
import { Badge } from "@/components/ui/badge";
import { CONTACT_GENERAL, CONTACT_PRIVACY, SITE_NAME, SITE_URL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: `${SITE_NAME}는 최신 의료 논문과 신뢰할 수 있는 매체를 기반으로 건강·헬스·다이어트 정보를 정리합니다. 운영자·검토자, 콘텐츠 검증 절차, 운영 약속을 안내합니다.`,
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
};

const OPERATOR = {
  name: "안 에디터",
  jobTitle: "건강 콘텐츠 리서치 에디터",
  motivation:
    "광고성 후기와 효능 과장 정보에 지쳐, 한국어 독자가 광고를 거치지 않고도 논문 근거로 건강 정보를 확인할 수 있는 사이트를 직접 만들기로 했습니다. 효능을 단정하기보다 출처와 한계를 함께 보여주는 글을 목표로 합니다.",
  description:
    "건강·헬스·다이어트 분야의 최신 논문과 신뢰 매체 보도를 한국어 독자가 이해하기 쉽게 정리합니다. 1인 운영 독립 사이트의 모든 글에 대해 자료 수집·교차 검증·편집 책임을 집니다.",
  honestyNote:
    "의사·약사·영양사 등 의료 자격은 보유하고 있지 않습니다. 따라서 본 사이트의 콘텐츠는 PubMed·Cochrane·공식 가이드라인·신뢰 매체 같은 외부 출처를 직접 인용해 정리하는 방식으로 운영되며, 진단·처방 같은 의학적 조언을 제공하지 않습니다.",
  knowsAbout: [
    "Intermittent fasting",
    "Diet",
    "Nutrition",
    "Exercise",
    "Sleep",
    "Chronic disease prevention",
  ],
  email: CONTACT_GENERAL,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/about#operator`,
      name: OPERATOR.name,
      jobTitle: OPERATOR.jobTitle,
      description: OPERATOR.description,
      knowsAbout: OPERATOR.knowsAbout,
      email: `mailto:${OPERATOR.email}`,
      worksFor: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        <PolicyHero
          badge="사이트 소개"
          title="헬스스캐너에 대해"
          description="최신 의료 논문과 신뢰할 수 있는 매체 보도를 한국어 독자가 이해하기 쉽게 정리합니다. 모든 글에 출처를 명시하고, 사람이 검토한 뒤에만 발행합니다."
        />
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
          />

          {/* 2. Why */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              왜 만들었나
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              한국어로 검색되는 건강 정보는 출처가 불분명하거나 효능이 과장된 경우가 많고,
              제대로 된 영문 논문 정보는 일반 독자가 접근하기 어려워요. 헬스스캐너는 그 사이의
              간격을 메우려고 만든 사이트입니다 — <strong>논문은 한국어로</strong>,{" "}
              <strong>출처는 클릭 한 번으로</strong>, <strong>한계는 솔직하게</strong>.
            </p>
          </section>

          {/* 3. 다루는 주제 / 다루지 않는 주제 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              다루는 주제 / 다루지 않는 주제
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">다루는 주제</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
                  <li>다이어트 (간헐적 단식·칼로리·저당)</li>
                  <li>운동·헬스 (유산소·근력·회복)</li>
                  <li>영양·보충제 (단백질·비타민·오메가3 — 효능 단정 ❌, 근거 정리 ✅)</li>
                  <li>수면·스트레스 (만성 피로·호르몬)</li>
                  <li>만성질환 예방 (당뇨·심혈관·대사증후군)</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">다루지 않는 주제</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
                  <li>개별 환자의 진단·처방·치료 가이드</li>
                  <li>응급 의료 결정 (119 / 응급실로)</li>
                  <li>검증되지 않은 대체 요법</li>
                  <li>의약품·건강기능식품의 효능을 단정하는 광고</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              위 &ldquo;다루지 않는 주제&rdquo;는 의료 전문가와 직접 상담하시기 바랍니다.
            </p>
          </section>

          {/* 4. 콘텐츠 검증 4단계 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              콘텐츠 검증 4단계
            </h2>
            <ol className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <li className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">1. 자료 수집</p>
                <p>
                  PubMed·Cochrane·공식 가이드라인(WHO·KDCA·NICE 등)·신뢰 매체(연합뉴스·BBC·NYT
                  헬스 데스크 등)에서 토픽 관련 자료를 모읍니다. 최근 5년 우선, 메타분석·RCT
                  우선.
                </p>
              </li>
              <li className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">2. 교차 검증</p>
                <p>
                  논문 PMID·DOI 를 직접 확인해 인용한 수치·결론이 원문과 일치하는지 점검합니다.
                  보도는 1차 출처(논문·기관)로 거슬러 올라가 사실 관계를 확인합니다.
                </p>
              </li>
              <li className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">3. AI 초안 작성</p>
                <p>
                  검증된 자료만 입력하여 생성형 AI(Gemini, OpenAI 등)의 도움으로 9섹션 구조의
                  초안을 작성합니다. AI 도구에는 이용자 식별 정보가 전송되지 않습니다.
                </p>
              </li>
              <li className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">4. 사람 검토·편집·발행</p>
                <p>
                  운영자가 출처 인용 정확성, 과장 표현 여부, 의학적 비대체 고지 노출 등을
                  점검한 뒤에만 발행됩니다. 발행 후 분기 1회 정기 재검토하며, 새로운 근거가
                  출현하면 즉시 갱신합니다.
                </p>
              </li>
            </ol>
          </section>

          {/* 5. 운영자 + 검토 프로세스 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              운영자 · 검토 프로세스
            </h2>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              현재 1인 운영입니다. 동일인 자가 검토는 신뢰의 한계가 분명해, 검토는 별도 사람이
              아닌 <strong>외부 출처 인용 + 자동 검증 도구 + 분기 재검토</strong> 프로세스로
              담보합니다. 외부 의료 전문가 자문위원은 별도 영입 중이며, 영입이 완료되면 이
              섹션에 실명·자격과 함께 공개할 계획입니다.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>운영자</Badge>
                </div>
                <p className="font-semibold text-gray-900 mb-1">{OPERATOR.name}</p>
                <p className="text-xs text-gray-500 mb-3">{OPERATOR.jobTitle}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {OPERATOR.motivation}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {OPERATOR.description}
                </p>
                <div className="mb-3 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-900">자격에 대한 솔직한 안내</strong> ·{" "}
                  {OPERATOR.honestyNote}
                </div>
                <p className="text-xs text-gray-500">
                  관심 분야:{" "}
                  <span className="text-gray-700">{OPERATOR.knowsAbout.join(", ")}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  연락:{" "}
                  <a
                    href={`mailto:${OPERATOR.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {OPERATOR.email}
                  </a>
                </p>
              </div>
              <div className="border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>검토 프로세스</Badge>
                </div>
                <p className="font-semibold text-gray-900 mb-1">
                  사람 단일 검토자 대신 4단계 프로세스
                </p>
                <p className="text-xs text-gray-500 mb-3">발행 전 + 발행 후</p>
                <ul className="space-y-2 text-sm text-gray-600 leading-relaxed list-disc list-inside pl-1">
                  <li>
                    <strong className="text-gray-900">외부 출처 인용</strong> · 본문 주장에 PMID·DOI
                    또는 매체·발행일·URL 명시
                  </li>
                  <li>
                    <strong className="text-gray-900">자동 검증</strong> · 본문에 인용한 PMID 가 실제
                    PubMed 에 존재하는지 발행 직전 자동 점검
                  </li>
                  <li>
                    <strong className="text-gray-900">사람 1차 검토</strong> · 운영자가 과장 표현,
                    의학적 비대체 고지 노출, 한계 단락 명시 여부 확인
                  </li>
                  <li>
                    <strong className="text-gray-900">분기 재검토</strong> · 발행 후 분기 1회 모든
                    글을 다시 살펴 새 근거 반영
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  외부 의료 전문가 자문위원 영입은 진행 중입니다. 자문위원 영입 시 본 섹션에 자격·이름
                  공개 예정.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  검토·정정 문의:{" "}
                  <a
                    href={`mailto:${CONTACT_PRIVACY}`}
                    className="text-blue-600 hover:underline"
                  >
                    {CONTACT_PRIVACY}
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* 6. 약속 4조 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              운영 약속 4조
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
              <li className="flex gap-3">
                <span className="font-semibold text-gray-900 shrink-0">1. 근거 우선</span>
                <span>
                  모든 주장에 학술 출처(PMID/DOI) 또는 보도 출처(매체명·발행일·URL)를
                  제시합니다.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-gray-900 shrink-0">2. 한계 고지</span>
                <span>
                  연구의 모집단·기간·방법론 한계와 일반화의 한계를 본문에 명시합니다. 단정
                  표현을 피합니다.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-gray-900 shrink-0">3. 광고 분리</span>
                <span>
                  광고나 제휴 관계가 콘텐츠의 작성·편집·노출 순위에 영향을 미치지 않도록
                  운영합니다. 자동광고는 사용하지 않으며, 제휴 링크는 본문에 명시합니다.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-gray-900 shrink-0">4. 정기 갱신</span>
                <span>
                  분기 1회 발행 글을 재검토하고, 새로운 근거가 출현하면 즉시 본문과 갱신
                  일자를 업데이트합니다.
                </span>
              </li>
            </ul>
          </section>

          {/* 7. 면책 + CTA */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              면책 및 문의
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 leading-relaxed mb-4">
              <strong>본 사이트의 모든 콘텐츠는 일반 정보 제공 목적이며, 의학적
                조언·진단·치료·처방을 대체하지 않습니다.</strong>{" "}
              개인의 건강 문제는 반드시 의료 전문가와 상담하세요. 자세한 내용은{" "}
              <Link
                href="/disclaimer"
                className="text-amber-900 hover:underline font-medium"
              >
                의료 면책 조항
              </Link>{" "}
              및{" "}
              <Link
                href="/terms"
                className="text-amber-900 hover:underline font-medium"
              >
                이용약관
              </Link>
              을 참고하세요.
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              사실 오류나 누락된 출처를 발견하셨다면{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                문의 페이지
              </Link>
              로 알려주세요. 빠르게 검토하고 수정하겠습니다.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
