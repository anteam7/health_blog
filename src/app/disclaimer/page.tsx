import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PolicyHero from "@/components/PolicyHero";
import { CONTACT_GENERAL } from "@/lib/legal";

const EFFECTIVE_DATE = "2026년 5월 9일";

export const metadata: Metadata = {
  title: "의료 면책 조항",
  description:
    "헬스스캐너의 콘텐츠는 일반 정보 제공이며, 의학적 진단·치료·처방을 대체하지 않습니다.",
};

export default function DisclaimerPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        <PolicyHero
          badge="법적 고지"
          title="의료 면책 조항"
          effectiveDate={EFFECTIVE_DATE}
          description="본 사이트의 모든 콘텐츠는 일반 정보 제공 목적이며, 의학적 진단·치료·처방을 대체하지 않습니다."
        />
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          <article className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-a:text-teal-700 prose-a:underline-offset-2 prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-xl">
            <h2>1. 일반 정보 제공 목적</h2>
            <p>
              헬스스캐너(이하 &ldquo;본 사이트&rdquo;)에 게시된 모든 콘텐츠는 일반적인
              건강·헬스·다이어트 정보 제공을 목적으로 합니다. 본 사이트의 어떠한 글도
              <strong> 의학적 조언, 진단, 치료, 처방을 대체하지 않습니다.</strong>
            </p>

            <h2>2. 전문가 상담 권고</h2>
            <p>
              특정 질환의 진단·치료, 약물의 사용·중단·변경, 식이요법 시작, 보충제 섭취,
              운동 프로그램 결정 등은 반드시 의사·약사·영양사·운동전문가 등 자격을 갖춘
              전문가와 상담한 뒤 결정하시기 바랍니다.
            </p>
            <p>
              특히 다음에 해당하시는 분은 본 사이트의 정보를 적용하기 전 의료 전문가와
              상담이 필요합니다.
            </p>
            <ul>
              <li>임신 또는 수유 중</li>
              <li>당뇨, 신장 질환, 심혈관 질환, 간 질환 등 만성질환 보유</li>
              <li>알레르기, 약물 부작용 이력</li>
              <li>현재 복용 중인 처방약이 있는 경우</li>
              <li>18세 미만 또는 65세 이상</li>
            </ul>

            <h2>3. 응급 상황 안내</h2>
            <p>
              의식 저하, 호흡 곤란, 심한 통증, 출혈 등 응급 의료 상황에서는 본 사이트의
              정보를 참고하지 마시고 즉시 <strong>119</strong>에 신고하거나 가까운 응급실을
              방문하세요.
            </p>

            <h2>4. 정보의 정확성과 한계</h2>
            <p>
              본 사이트는 작성 시점의 최신 의료 논문과 신뢰할 수 있는 매체를 근거로
              정보를 정리합니다. 그러나 의학 지식은 빠르게 변화하며, 과거에 옳다고 여겨졌던
              정보가 새로운 연구로 갱신될 수 있습니다. 본 사이트의 정보가 모든 개인의 상황에
              적용되지 않을 수 있으며, 정보의 완결성·최신성·특정 목적 적합성을 보장하지
              않습니다.
            </p>
            <p>
              발행된 모든 글은 운영자의 검토를 거치며, <strong>분기 1회 정기 재검토</strong>를
              진행합니다. 새로운 근거가 출현하는 경우에는 정기 일정과 무관하게 즉시 본문과
              갱신 일자를 업데이트합니다. 글 페이지 상단의 &ldquo;마지막 검토일&rdquo; 표기와
              구조화 데이터(<code>reviewedBy</code>, <code>lastReviewed</code>)에서 검토 이력을
              확인하실 수 있습니다.
            </p>

            <h2>5. 외부 링크</h2>
            <p>
              본 사이트는 PubMed, 의학 저널, 보건 기관, 뉴스 매체 등 외부 사이트로의 링크를
              포함합니다. 외부 사이트의 콘텐츠·정확성·정책에 대해서는 본 사이트가 책임지지
              않습니다.
            </p>

            <h2>6. 책임의 한계</h2>
            <p>
              본 사이트의 콘텐츠를 이용하거나 적용함으로써 발생할 수 있는 직접적·간접적
              손해(건강상 결과, 재산상 손실 등 포함)에 대해 본 사이트 운영자는 법이 허용하는
              한도 내에서 책임을 지지 않습니다.
            </p>

            <h2>7. 광고 및 제휴</h2>
            <p>
              본 사이트는 Google AdSense 등 외부 광고 서비스를 통해 광고를 게재할 수 있으며,
              제휴 마케팅(affiliate) 링크를 포함할 수 있습니다. 광고나 제휴 콘텐츠는 별도의
              의학적 권고가 아니며, 본 사이트의 의료 면책 조항이 동일하게 적용됩니다.
            </p>

            <h2>8. 문의</h2>
            <p>
              본 면책 조항이나 콘텐츠에 대한 문의는{" "}
              <a href={`mailto:${CONTACT_GENERAL}`}>{CONTACT_GENERAL}</a> 으로
              보내주세요.
            </p>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
