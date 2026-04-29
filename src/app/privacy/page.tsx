import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "헬스스캐너의 개인정보 수집·이용·보관·제3자 제공·쿠키 정책",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-4 py-12 prose prose-zinc">
          <h1>개인정보처리방침</h1>
          <p>최종 수정일: 2026년 4월 29일</p>

          <p>
            헬스스캐너(이하 &ldquo;본 사이트&rdquo;)는 개인정보 보호법 등 관련 법령을
            준수하며, 이용자의 개인정보를 안전하게 처리하기 위해 본 방침을 수립합니다.
          </p>

          <h2>1. 수집하는 개인정보 항목</h2>
          <p>본 사이트는 다음 정보를 수집할 수 있습니다.</p>
          <ul>
            <li>
              <strong>자동 수집</strong>: 접속 IP, 브라우저 종류·버전, 운영체제, 접속 일시,
              방문 페이지, 리퍼러(referrer) URL
            </li>
            <li>
              <strong>문의 시</strong>: 이름(또는 닉네임), 이메일 주소, 문의 내용
            </li>
            <li>
              <strong>관리자 영역</strong>: 운영자가 직접 가입한 계정의 이메일·암호 해시
            </li>
          </ul>

          <h2>2. 수집·이용 목적</h2>
          <ul>
            <li>웹사이트 운영 및 콘텐츠 제공</li>
            <li>방문 통계, 콘텐츠 개선, 부정 이용 차단</li>
            <li>문의 응대</li>
            <li>맞춤형 광고 게재(쿠키 동의 시)</li>
          </ul>

          <h2>3. 보유·이용 기간</h2>
          <ul>
            <li>접속 로그: 최대 6개월 (보안 사고 대응 목적)</li>
            <li>문의 내용: 응대 완료 후 1년</li>
            <li>관리자 계정: 운영자 본인 요청 시 즉시 삭제</li>
          </ul>

          <h2>4. 제3자 제공 및 위탁</h2>
          <p>
            본 사이트는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만 다음 외부 서비스를 운영 목적으로 이용하며, 해당 서비스에 한해 제한적
            정보가 처리될 수 있습니다.
          </p>
          <ul>
            <li>
              <strong>Vercel Inc.</strong> (호스팅) — 접속 로그, IP, User-Agent
              <br />
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보처리방침
              </a>
            </li>
            <li>
              <strong>Supabase Inc.</strong> (데이터베이스, 인증) — 관리자 인증 정보,
              사이트 데이터
              <br />
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보처리방침
              </a>
            </li>
            <li>
              <strong>Google LLC</strong> (Google Analytics, AdSense — 도입 시)
              <br />
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보처리방침
              </a>
            </li>
          </ul>

          <h2>5. 쿠키 및 광고</h2>
          <p>
            본 사이트는 사용자 경험 개선과 통계 측정을 위해 쿠키(cookie) 및 유사 기술을
            사용할 수 있습니다. 향후 Google AdSense를 도입할 경우, 제3자 공급업체와 광고
            네트워크가 광고 서비스를 위해 쿠키를 사용할 수 있습니다.
          </p>
          <p>
            이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. 쿠키를 거부할 경우
            일부 서비스 이용이 제한될 수 있습니다.
          </p>
          <p>
            Google의 광고 쿠키 사용 및 거부 방법은 다음에서 확인하실 수 있습니다.
          </p>
          <ul>
            <li>
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 광고 정책
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 광고 설정
              </a>
            </li>
          </ul>

          <h2>6. 이용자의 권리</h2>
          <p>
            이용자는 언제든지 본 사이트에 자신의 개인정보 열람·정정·삭제·처리정지를
            요청할 수 있습니다. 요청은 아래 연락처로 보내주세요.
          </p>

          <h2>7. 개인정보 보호 책임자</h2>
          <ul>
            <li>책임자: 안승혁</li>
            <li>이메일: <a href="mailto:somonday@gmail.com">somonday@gmail.com</a></li>
          </ul>

          <h2>8. 본 방침의 변경</h2>
          <p>
            본 방침은 법령·서비스의 변경에 따라 수정될 수 있으며, 변경 시 본 페이지를
            통해 공지합니다.
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
