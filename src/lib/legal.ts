// 정책 페이지(개인정보·이용약관 등) 공통 상수.
// 시행일을 한 곳에 두어 모든 정책 페이지의 footer/배지/canonical 헤더가 일관되게 갱신되도록 한다.

export const SITE_NAME = "헬스스캐너" as const;
export const SITE_HOST = "healthscanner.co.kr" as const;
export const SITE_URL = `https://${SITE_HOST}` as const;

export const PRIVACY_EFFECTIVE_DATE = "2026년 5월 9일" as const;
export const TERMS_EFFECTIVE_DATE = "2026년 5월 9일" as const;

// 변경 이력 — 시행일 갱신 시 새 항목을 위에 prepend.
export interface LegalChangeEntry {
  version: string;
  date: string;
  summary: string;
}

export const PRIVACY_CHANGES: readonly LegalChangeEntry[] = [
  {
    version: "v1.0",
    date: "2026년 5월 9일",
    summary:
      "최초 제정 — 자동수집·광고 자동수집·위탁 표·쿠키 Opt-out·권익침해 4기관·AI 보조 작성 고지·변경 이력 표 포함",
  },
] as const;

// 2026-05-09 사용자 명시: 개인 이메일(anseunghyok@gmail.com) 노출 회피, somonday로 통일
export const CONTACT_GENERAL = "somonday@gmail.com" as const;
export const CONTACT_PRIVACY = "somonday@gmail.com" as const;
