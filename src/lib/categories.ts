// 블로그 카테고리 화이트리스트
//
// DB 의 health_contents.category CHECK 제약 (2026-05-09_health_contents_meta.sql)
// 과 항상 동기되어야 한다 — 새 카테고리 추가 시 SQL 마이그레이션 한 번 더.
//
// 5개로 고정한 이유: AdSense 승인 단계에서 토픽 클러스터 깊이를 확보하기 위함.
// 너무 잘게 쪼개면 카테고리당 글 수가 적어 보여서 역효과.

// 카테고리별 컬러 코드 — 권위감 있는 건강 매체 톤 (Healthline/NYT Well 참고)
// Tailwind 클래스 + hex (스키마/JSON-LD/이미지 placeholder 등 hex 필요한 곳용)
export const BLOG_CATEGORIES = [
  {
    slug: "diet",
    label: "다이어트",
    description: "간헐적 단식, 칼로리 제한, 탄수화물·저당 등 체중 관리",
    color: {
      hex: "#059669", // emerald-600
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      hover: "hover:bg-emerald-100",
      ring: "ring-emerald-600",
      solid: "bg-emerald-600",
      solidHover: "hover:bg-emerald-700",
    },
  },
  {
    slug: "fitness",
    label: "운동·헬스",
    description: "유산소·근력 운동, 회복, 부상 예방, 운동 영양",
    color: {
      hex: "#ea580c", // orange-600
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      hover: "hover:bg-orange-100",
      ring: "ring-orange-600",
      solid: "bg-orange-600",
      solidHover: "hover:bg-orange-700",
    },
  },
  {
    slug: "nutrition",
    label: "영양·보충제",
    description: "단백질·비타민·오메가3 등 영양소와 보충제 근거 정리",
    color: {
      hex: "#d97706", // amber-600
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      hover: "hover:bg-amber-100",
      ring: "ring-amber-600",
      solid: "bg-amber-600",
      solidHover: "hover:bg-amber-700",
    },
  },
  {
    slug: "sleep-stress",
    label: "수면·스트레스",
    description: "만성 피로, 멘탈 헬스, 호르몬, 회복 수면",
    color: {
      hex: "#7c3aed", // violet-600
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
      hover: "hover:bg-violet-100",
      ring: "ring-violet-600",
      solid: "bg-violet-600",
      solidHover: "hover:bg-violet-700",
    },
  },
  {
    slug: "chronic-prevention",
    label: "만성질환 예방",
    description: "당뇨·심혈관·대사증후군 예방 정보 (진단·처방 ❌)",
    color: {
      hex: "#e11d48", // rose-600
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      hover: "hover:bg-rose-100",
      ring: "ring-rose-600",
      solid: "bg-rose-600",
      solidHover: "hover:bg-rose-700",
    },
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

export function getCategory(slug: string | null | undefined) {
  if (!slug) return null;
  return BLOG_CATEGORIES.find((c) => c.slug === slug) ?? null;
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
