// health_topics 공용 타입/상수

export const TOPIC_STATUSES = [
  { value: "candidate", label: "후보" },
  { value: "planned", label: "계획됨" },
  { value: "in_progress", label: "진행중" },
  { value: "completed", label: "완료" },
  { value: "archived", label: "보관" },
] as const;

export type TopicStatus = (typeof TOPIC_STATUSES)[number]["value"];

export interface ClusterRoadmapItem {
  order: number;
  slug: string;
  title: string;
  target_keyword?: string | null;
  primary_source_pmid?: string | null;
  status: "candidate" | "planned" | "drafting" | "draft" | "review" | "published";
  content_id?: string | null;
  notes?: string | null;
}

export interface HealthTopic {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  keywords: string[] | null;
  status: TopicStatus;
  priority: number | null;
  cluster_roadmap: ClusterRoadmapItem[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function topicStatusLabel(s: string): string {
  return TOPIC_STATUSES.find((x) => x.value === s)?.label ?? s;
}

const ROADMAP_LABEL: Record<string, string> = {
  candidate: "후보",
  planned: "계획",
  drafting: "작성중",
  draft: "초안",
  review: "검토",
  published: "발행",
};

export function roadmapItemStatusLabel(s: string): string {
  return ROADMAP_LABEL[s] ?? s;
}
