// 블로그 카테고리 화이트리스트
//
// DB 의 health_contents.category CHECK 제약 (2026-05-09_health_contents_meta.sql)
// 과 항상 동기되어야 한다 — 새 카테고리 추가 시 SQL 마이그레이션 한 번 더.
//
// 5개로 고정한 이유: AdSense 승인 단계에서 토픽 클러스터 깊이를 확보하기 위함.
// 너무 잘게 쪼개면 카테고리당 글 수가 적어 보여서 역효과.

export const BLOG_CATEGORIES = [
  {
    slug: "diet",
    label: "다이어트",
    description: "간헐적 단식, 칼로리 제한, 탄수화물·저당 등 체중 관리",
  },
  {
    slug: "fitness",
    label: "운동·헬스",
    description: "유산소·근력 운동, 회복, 부상 예방, 운동 영양",
  },
  {
    slug: "nutrition",
    label: "영양·보충제",
    description: "단백질·비타민·오메가3 등 영양소와 보충제 근거 정리",
  },
  {
    slug: "sleep-stress",
    label: "수면·스트레스",
    description: "만성 피로, 멘탈 헬스, 호르몬, 회복 수면",
  },
  {
    slug: "chronic-prevention",
    label: "만성질환 예방",
    description: "당뇨·심혈관·대사증후군 예방 정보 (진단·처방 ❌)",
  },
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]["slug"];

export function isBlogCategorySlug(value: unknown): value is BlogCategorySlug {
  return (
    typeof value === "string" &&
    BLOG_CATEGORIES.some((c) => c.slug === value)
  );
}

export function getCategoryLabel(slug: string): string | null {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)?.label ?? null;
}

// 근거 강도 라벨 (evidence_level 컬럼)
export const EVIDENCE_LEVELS = [
  { value: "meta", label: "메타분석", weight: 5 },
  { value: "rct", label: "RCT", weight: 4 },
  { value: "guideline", label: "가이드라인", weight: 4 },
  { value: "review", label: "리뷰 논문", weight: 3 },
  { value: "news", label: "보도", weight: 1 },
] as const;

export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number]["value"];

export function evidenceLabel(value: string): string | null {
  return EVIDENCE_LEVELS.find((e) => e.value === value)?.label ?? null;
}
