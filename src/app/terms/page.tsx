import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import {
  CONTACT_GENERAL,
  SITE_HOST,
  SITE_NAME,
  SITE_URL,
  TERMS_EFFECTIVE_DATE,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${SITE_NAME} 서비스 이용에 관한 약관 — 정보 콘텐츠 제공 범위, 의학적 비대체 고지, 책임 제한, 광고·제휴 정책을 안내합니다.`,
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-10">
            <Badge className="mb-3">법적 고지</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">이용약관</h1>
            <p className="text-sm text-gray-500">시행일: {TERMS_EFFECTIVE_DATE}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-10 text-sm text-blue-900 leading-relaxed">
            본 약관은 {SITE_NAME}(이하 &ldquo;본 사이트&rdquo;)가 제공하는 건강·헬스·다이어트
            정보 콘텐츠 서비스의 이용 조건과 절차, 이용자와 운영자 간의 권리·의무 및 책임
            사항을 규정합니다. 본 사이트는 <strong>일반 정보 제공 서비스</strong>이며, 의학적
            진단·치료·처방 등 의료 행위를 직접 제공하거나 대체하지 않습니다.
          </div>

          {/* 1 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">제1조 (목적)</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              본 약관은 이용자가 본 사이트가 제공하는 건강·헬스·다이어트 정보 콘텐츠
              서비스를 이용함에 있어 이용자와 운영자의 권리·의무 및 책임 사항, 기타 필요한
              사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 2 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제2조 (용어의 정의)
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
            </p>
            <ol className="text-sm text-gray-600 space-y-2 pl-2">
              <li>
                <strong className="text-gray-900">1. &ldquo;서비스&rdquo;</strong>란 {SITE_NAME}(
                <Link href="/" className="text-blue-600 hover:underline">
                  www.{SITE_HOST}
                </Link>
                )가 제공하는 건강·헬스·다이어트 분야의 정보 콘텐츠, 검색·필터링 기능, 가이드
                등 모든 정보 제공 기능을 의미합니다.
              </li>
              <li>
                <strong className="text-gray-900">2. &ldquo;이용자&rdquo;</strong>란 본 약관에
                따라 서비스에 접속하여 이를 이용하는 모든 개인 및 법인을 의미합니다.
              </li>
              <li>
                <strong className="text-gray-900">3. &ldquo;콘텐츠&rdquo;</strong>란 서비스가
                제공하는 글·이미지·표·인용 출처 등 모든 형태의 정보 자료를 의미합니다.
              </li>
              <li>
                <strong className="text-gray-900">4. &ldquo;출처&rdquo;</strong>란 콘텐츠 작성에
                인용된 학술 논문(PubMed PMID·DOI), 보도(매체명·발행일·URL), 공식 가이드라인
                등을 의미합니다.
              </li>
            </ol>
          </section>

          {/* 3 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제3조 (약관의 효력 및 변경)
            </h2>
            <ol className="text-sm text-gray-600 space-y-2 pl-2 leading-relaxed">
              <li>1. 본 약관은 서비스 내 공지를 통해 이용자에게 공시함으로써 효력이 발생합니다.</li>
              <li>
                2. 운영자는 관련 법령을 위배하지 않는 범위 내에서 본 약관을 개정할 수 있으며,
                개정된 약관은 적용일자 7일 전부터 서비스 내에 공지합니다. 다만, 이용자에게
                불리한 변경의 경우에는 30일 전에 공지합니다.
              </li>
              <li>
                3. 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있으며,
                변경된 약관의 효력 발생일 이후에도 서비스를 계속 이용하는 경우 약관의 변경에
                동의한 것으로 간주합니다.
              </li>
            </ol>
          </section>

          {/* 4 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제4조 (서비스의 제공)
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              본 사이트가 제공하는 서비스는 다음과 같습니다.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 pl-2">
              <li>
                건강·헬스·다이어트(다이어트, 운동·헬스, 영양·보충제, 수면·스트레스, 만성질환
                예방) 분야의 정보 콘텐츠 제공
              </li>
              <li>카테고리·태그·키워드 기반 검색·필터링 기능</li>
              <li>학술 논문·보도 출처를 인용한 근거 기반 정보 정리</li>
              <li>기타 운영자가 필요하다고 판단하는 부가 정보 서비스</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              본 사이트의 콘텐츠는 운영자가 입력한 자료에 기반하여 생성형 AI의 도움을 받아
              초안이 작성될 수 있으며, 사람이 검토·편집한 후 발행됩니다. 자세한 검증 절차는{" "}
              <Link href="/about" className="text-blue-600 hover:underline">
                사이트 소개
              </Link>{" "}
              참조.
            </p>
          </section>

          {/* 5 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제5조 (서비스의 이용)
            </h2>
            <ol className="text-sm text-gray-600 space-y-2 pl-2 leading-relaxed">
              <li>1. 본 사이트는 별도의 회원가입 절차 없이 누구나 무료로 이용할 수 있는 공개 서비스입니다.</li>
              <li>
                2. 서비스 이용 시간은 연중무휴, 1일 24시간을 원칙으로 합니다. 다만, 정기
                점검·긴급 조치가 필요한 경우에는 일시적으로 중단될 수 있습니다.
              </li>
              <li>
                3. 운영자는 사전 공지 없이 서비스의 내용을 변경하거나 중단할 수 있으며, 이로
                인한 이용자의 불편에 대해 본 약관 제9조의 책임 제한 범위 내에서 책임을 집니다.
              </li>
            </ol>
          </section>

          {/* 6 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제6조 (이용자의 의무)
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              이용자는 다음 각 호에 해당하는 행위를 하여서는 안 됩니다.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 pl-2">
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스에 게시된 정보를 허위로 변조하거나 무단 복제·배포하는 행위</li>
              <li>자동화된 수단(크롤러, 봇 등)으로 과도한 트래픽을 발생시키는 행위</li>
              <li>본 사이트의 콘텐츠를 의학적 진단·처방의 근거로 단정 인용하는 행위</li>
              <li>타인의 권리를 침해하거나 법령을 위반하는 행위</li>
              <li>기타 공공질서 및 미풍양속에 반하는 행위</li>
            </ul>
          </section>

          {/* 7 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제7조 (지적재산권)
            </h2>
            <ol className="text-sm text-gray-600 space-y-2 pl-2 leading-relaxed">
              <li>
                1. 서비스에 포함된 콘텐츠(텍스트, 그래픽, 로고, 데이터베이스 등)의 저작권 및
                지적재산권은 운영자에게 귀속됩니다. 단, 인용된 논문·보도·이미지의 권리는 각
                저작권자에게 귀속되며, 본 사이트는 이를 인용·요약하여 정보 제공 목적으로
                사용합니다.
              </li>
              <li>
                2. 이용자는 서비스를 통해 얻은 정보를 운영자의 사전 승낙 없이 영리 목적으로
                복제·전송·출판·배포 등의 방법으로 이용할 수 없습니다.
              </li>
              <li>3. 개인적·비영리적 용도의 열람과 참고는 자유롭게 허용됩니다.</li>
            </ol>
          </section>

          {/* 8 — 핵심: 의학적 비대체 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제8조 (정보의 정확성 및 의학적 비대체)
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                본 사이트는 작성 시점의 학술 논문·공식 가이드라인·신뢰할 수 있는 보도를
                근거로 콘텐츠를 정리합니다. 다만, 다음과 같은 한계가 있음을 명확히 고지합니다.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  의학 지식은 빠르게 변화하며, 과거에 옳다고 여겨졌던 정보가 새로운 연구로
                  갱신될 수 있습니다.
                </li>
                <li>
                  콘텐츠에서 다루는 효과·부작용·권장량 등은 연구 모집단의 평균치이며, 모든
                  개인의 상황에 동일하게 적용되지 않을 수 있습니다.
                </li>
                <li>
                  본 사이트는 정보의 완결성·최신성·특정 목적 적합성을 보장하지 않습니다.
                </li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900">
                <strong>본 사이트의 모든 콘텐츠는 일반 정보 제공 목적이며, 의학적 조언·진단·치료·처방을 대체하지 않습니다.</strong>{" "}
                특정 질환의 진단·치료, 약물의 사용·중단·변경, 식이요법 시작, 보충제 섭취,
                운동 프로그램 결정 등은 반드시 의사·약사·영양사·운동전문가 등 자격을 갖춘
                전문가와 상담한 뒤 결정하시기 바랍니다. 자세한 내용은{" "}
                <Link href="/disclaimer" className="text-amber-900 hover:underline font-medium">
                  의료 면책 조항
                </Link>
                을 참고해 주세요.
              </div>
            </div>
          </section>

          {/* 9 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제9조 (책임 제한)
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              본 사이트는 다음 각 호의 사항에 대해 법이 허용하는 한도 내에서 책임을 지지
              않습니다.
            </p>
            <ol className="text-sm text-gray-600 space-y-2 pl-2 leading-relaxed">
              <li>
                1. 이용자가 본 사이트의 콘텐츠를 기반으로 결정한 식이·운동·보충제 섭취·약물
                사용 변경 등의 결과로 발생한 직접적·간접적 손해(건강상 결과, 재산상 손실 등
                포함). 의학적 결정의 최종 책임은 이용자와 의료 전문가에게 있습니다.
              </li>
              <li>
                2. 콘텐츠 작성 시점 이후의 연구 갱신·법령 변경·제품 정보 변경 등으로 인한
                정보의 부정확성.
              </li>
              <li>
                3. 천재지변, 전쟁, 운영자의 귀책사유가 없는 네트워크 장애, 해킹, 기타
                불가항력으로 인하여 서비스를 제공할 수 없는 경우.
              </li>
              <li>
                4. 외부 링크(논문 데이터베이스, 보도 매체, 공식 가이드라인 등)를 통해 접속한
                외부 서비스의 콘텐츠 및 약관은 본 사이트의 관리 범위를 벗어나며, 이에 대한
                책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          {/* 10 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제10조 (개인정보의 보호)
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              본 사이트는 이용자의 개인정보를 중요하게 생각하며, 관련 법령에 따라 보호합니다.
              개인정보의 수집, 이용, 보관, 파기에 관한 구체적인 사항은{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                개인정보처리방침
              </Link>
              을 참고해 주시기 바랍니다.
            </p>
          </section>

          {/* 11 — 광고/제휴 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제11조 (광고 및 제휴)
            </h2>
            <ol className="text-sm text-gray-600 space-y-2 pl-2 leading-relaxed">
              <li>
                1. 본 사이트는 운영비 충당을 위해 Google AdSense 등 외부 광고 서비스를 통해
                광고를 게재할 수 있으며, 제휴 마케팅(어필리에이트) 링크를 포함할 수 있습니다.
              </li>
              <li>
                2. 의료 콘텐츠 컨텍스트의 안전을 위해{" "}
                <strong className="text-gray-900">자동 광고를 사용하지 않으며</strong>, 본문 내
                지정된 위치의 수동 광고 슬롯만 운영합니다. 정책 페이지 및 면책 조항 페이지에는
                광고를 노출하지 않습니다.
              </li>
              <li>
                3. 광고 또는 제휴 관계가{" "}
                <strong className="text-gray-900">콘텐츠의 작성·편집·노출 순위에 영향을 미치지 않도록</strong>{" "}
                운영하며, 제휴 링크가 포함된 콘텐츠에는 그 사실을 명확히 표시합니다.
              </li>
              <li>
                4. 본 사이트는 의약품·건강기능식품의 효능을 단정하는 광고나, 의료 행위를
                대체하는 것으로 오해될 수 있는 광고는 게재하지 않습니다. 광고나 제휴 콘텐츠도{" "}
                <Link href="/disclaimer" className="text-blue-600 hover:underline">
                  의료 면책 조항
                </Link>
                이 동일하게 적용됩니다.
              </li>
            </ol>
          </section>

          {/* 12 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제12조 (분쟁의 해결)
            </h2>
            <ol className="text-sm text-gray-600 space-y-2 pl-2 leading-relaxed">
              <li>
                1. 서비스 이용과 관련하여 이용자와 운영자 간에 발생한 분쟁은 상호 협의를 통해
                원만하게 해결함을 원칙으로 합니다.
              </li>
              <li>
                2. 협의가 이루어지지 않을 경우, 본 약관은 대한민국 법령에 따라 규율되며,
                분쟁에 관한 소는 민사소송법상의 관할법원에 제기합니다.
              </li>
            </ol>
          </section>

          {/* 13 */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b">
              제13조 (문의 및 연락처)
            </h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-sm text-gray-700">
              <p className="text-gray-700 mb-2 leading-relaxed">
                본 약관과 관련한 문의, 의견, 오류 제보, 제휴 문의 등은 아래로 연락해 주시기
                바랍니다.
              </p>
              <ul className="space-y-1">
                <li>운영: {SITE_NAME} (1인 운영 독립 사이트)</li>
                <li>
                  이메일:{" "}
                  <a
                    href={`mailto:${CONTACT_GENERAL}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {CONTACT_GENERAL}
                  </a>
                </li>
                <li>
                  웹사이트:{" "}
                  <Link href="/" className="text-blue-600 hover:underline">
                    www.{SITE_HOST}
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-sm text-gray-600 mt-12">
            <p className="font-semibold text-gray-900 mb-1">부칙</p>
            <p>
              본 약관은 <strong>{TERMS_EFFECTIVE_DATE}</strong>부터 시행됩니다.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
