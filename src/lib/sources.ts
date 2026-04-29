// health_sources 공용 타입/상수

export const SOURCE_TYPES = [
  { value: "paper", label: "논문" },
  { value: "news", label: "뉴스" },
  { value: "guideline", label: "가이드라인" },
  { value: "video", label: "영상" },
  { value: "other", label: "기타" },
] as const;

export const SOURCE_STATUSES = [
  { value: "collected", label: "수집됨" },
  { value: "reviewed", label: "검토 완료" },
  { value: "used", label: "글로 작성됨" },
  { value: "archived", label: "보관" },
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number]["value"];
export type SourceStatus = (typeof SOURCE_STATUSES)[number]["value"];

export interface HealthSource {
  id: string;
  source_type: SourceType;
  title: string;
  url: string;
  doi: string | null;
  pmid: string | null;
  authors: string[] | null;
  outlet: string | null;
  published_date: string | null;
  abstract: string | null;
  key_findings: string | null;
  topics: string[] | null;
  quality_score: number | null;
  status: SourceStatus;
  linked_content_id: string | null;
  notes: string | null;
  collected_by: string | null;
  collected_at: string;
  updated_at: string;
}

export type SourceUpsert = Omit<
  HealthSource,
  "id" | "collected_at" | "updated_at" | "linked_content_id"
> & {
  linked_content_id?: string | null;
};

export function sourceTypeLabel(t: string): string {
  return SOURCE_TYPES.find((s) => s.value === t)?.label ?? t;
}

export function sourceStatusLabel(s: string): string {
  return SOURCE_STATUSES.find((x) => x.value === s)?.label ?? s;
}
