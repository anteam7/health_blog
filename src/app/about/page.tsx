import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: "헬스스캐너는 최신 의료 논문과 신뢰할 수 있는 매체를 기반으로 건강·헬스·다이어트 정보를 정리합니다.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-4 py-12 prose prose-zinc">
          <h1>사이트 소개</h1>

          <p>
            <strong>헬스스캐너</strong>는 건강·헬스·다이어트 분야에서 신뢰할 수 있는 정보를 한국어로
            제공하기 위해 만든 사이트입니다. 모든 글은 <strong>최신 의료 논문</strong>과 신뢰할 수
            있는 <strong>매체의 보도</strong>를 근거로 작성하며, 본문 하단에 출처를 명시합니다.
          </p>

          <h2>운영 원칙</h2>
          <ul>
            <li>
              <strong>근거 기반(evidence-based)</strong>: 인용된 모든 주장에 학술 출처(논문 DOI/PMID)
              또는 보도 출처(매체명, 발행일, URL)를 함께 제시합니다.
            </li>
            <li>
              <strong>YMYL 윤리</strong>: 건강 정보는 사람의 삶에 영향을 주는 분야입니다.
              단정적 의료 효능 주장이나 의약품의 무허가 광고를 하지 않습니다.
            </li>
            <li>
              <strong>편집 후 발행</strong>: AI 도구를 활용해 자료를 정리하더라도,
              모든 글은 사람의 검토와 편집을 거친 뒤에만 발행됩니다.
            </li>
            <li>
              <strong>투명한 갱신</strong>: 새로운 근거가 나오면 글을 업데이트하고, 변경 일시를
              명시합니다.
            </li>
          </ul>

          <h2>다루는 주제</h2>
          <p>건강한 식단, 운동, 다이어트, 보충제, 만성질환 예방, 수면·스트레스 관리 등.</p>

          <h2>다루지 않는 주제</h2>
          <p>
            개별 환자의 진단·처방·치료 가이드, 응급 의료 결정, 검증되지 않은 대체 요법.
            이런 주제는 의료 전문가와 직접 상담하시기 바랍니다.
          </p>

          <h2>운영자</h2>
          <p>
            대표 운영자: 안승혁 (이메일: <a href="mailto:anseunghyok@gmail.com">anseunghyok@gmail.com</a>)
            <br />
            개인정보 보호 책임자: <a href="mailto:somonday@gmail.com">somonday@gmail.com</a>
          </p>

          <h2>의뢰·제휴 문의</h2>
          <p>
            <a href="/contact">/contact</a> 페이지를 참고하세요.
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
