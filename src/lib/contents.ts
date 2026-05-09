// health_contents 공용 타입/상수

export const CONTENT_STATUSES = [
  { value: "draft", label: "초안" },
  { value: "review", label: "검토" },
  { value: "published", label: "발행" },
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number]["value"];

export interface HealthContent {
  id: string;
  slug: string;
  title: string;
  body_md: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  source_ids: string[] | null;
  topic_id: string | null;
  // AdSense / E-E-A-T 메타 (2026-05-09 마이그레이션)
  category: string | null;
  author_name: string | null;
  author_credential: string | null;
  reviewed_at: string | null;
  reviewer_name: string | null;
  reviewer_credential: string | null;
  evidence_level: string | null;
}

export function contentStatusLabel(s: string): string {
  return CONTENT_STATUSES.find((x) => x.value === s)?.label ?? s;
}
