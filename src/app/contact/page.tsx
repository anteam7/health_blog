import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "문의",
  description: "헬스스캐너에 문의·제보·정정 요청을 보내실 수 있습니다.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-4 py-12 prose prose-zinc">
          <h1>문의</h1>

          <p>
            헬스스캐너에 대한 모든 문의는 이메일로 받습니다. 아래 항목 중 해당하는
            연락처로 보내주세요.
          </p>

          <h2>일반 문의 · 제보 · 정정 요청</h2>
          <p>
            <a href="mailto:anseunghyok@gmail.com">anseunghyok@gmail.com</a>
          </p>
          <p>
            글에 사실 오류나 누락된 출처가 있다면 알려주세요. 빠르게 검토하고 수정하겠습니다.
          </p>

          <h2>개인정보 관련 문의</h2>
          <p>
            <a href="mailto:somonday@gmail.com">somonday@gmail.com</a>
          </p>
          <p>
            개인정보의 열람·정정·삭제·처리정지 요청, 개인정보처리방침 관련 문의를 받습니다.
          </p>

          <h2>제휴 · 광고 문의</h2>
          <p>
            <a href="mailto:anseunghyok@gmail.com">anseunghyok@gmail.com</a>
          </p>
          <p>
            본 사이트는 콘텐츠의 독립성을 유지하기 위해 의약품·건강기능식품의 직접 광고나
            과장된 효능을 주장하는 제휴는 받지 않습니다.
          </p>

          <h2>응답 기간</h2>
          <p>
            평일 기준 영업일 3일 이내 답변을 목표로 합니다. 의료 응급 상황은 본 사이트가
            아닌 <strong>119</strong> 또는 응급실로 연락하세요.
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
