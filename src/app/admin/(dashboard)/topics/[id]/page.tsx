import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import { Badge } from "@/components/ui/badge";
import {
  topicStatusLabel,
  roadmapItemStatusLabel,
  type ClusterRoadmapItem,
  type HealthTopic,
} from "@/lib/topics";
import { contentStatusLabel } from "@/lib/contents";
import { sourceTypeLabel } from "@/lib/sources";

export const dynamic = "force-dynamic";

interface SourceRow {
  id: string;
  source_type: string;
  title: string;
  outlet: string | null;
  status: string;
  pmid: string | null;
}

interface ContentRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  source_ids: string[] | null;
  updated_at: string;
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = createAdminClient();
  const { data: topicRaw, error } = await sb
    .from("health_topics")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !topicRaw) notFound();

  const topic = topicRaw as HealthTopic;
  const roadmap = (topic.cluster_roadmap ?? []) as ClusterRoadmapItem[];

  const [sourcesRes, contentsRes] = await Promise.all([
    sb
      .from("health_sources")
      .select("id, source_type, title, outlet, status, pmid")
      .eq("topic_id", id)
      .order("source_type"),
    sb
      .from("health_contents")
      .select("id, slug, title, status, source_ids, updated_at")
      .eq("topic_id", id)
      .order("updated_at", { ascending: false }),
  ]);
  const sources = (sourcesRes.data ?? []) as SourceRow[];
  const contents = (contentsRes.data ?? []) as ContentRow[];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/topics"
          className="text-sm text-gray-500 hover:underline"
        >
          ← 토픽 목록
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{topic.title}</h1>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-mono">{topic.slug}</span> · 우선순위{" "}
              {topic.priority ?? "—"} · 수정{" "}
              {new Date(topic.updated_at).toLocaleString("ko-KR")}
            </p>
          </div>
          <Badge
            variant={topic.status === "in_progress" ? "default" : "outline"}
          >
            {topicStatusLabel(topic.status)}
          </Badge>
        </div>
        {topic.description && (
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">
            {topic.description}
          </p>
        )}
        {topic.keywords && topic.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topic.keywords.map((k) => (
              <span
                key={k}
                className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-700"
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">
          클러스터 로드맵 ({roadmap.length}편)
        </h2>
        <div className="rounded-md border bg-white divide-y">
          {roadmap.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">
              로드맵이 비어 있습니다.
            </div>
          )}
          {roadmap.map((r) => (
            <div
              key={`${r.order}-${r.slug}`}
              className="px-4 py-3 flex items-start gap-3"
            >
              <div className="w-8 text-xs text-gray-500 shrink-0 mt-0.5">
                #{r.order}
              </div>
              <div className="flex-1 min-w-0">
                {r.content_id ? (
                  <Link
                    href={`/admin/contents/${r.content_id}`}
                    className="font-medium hover:underline"
                  >
                    {r.title}
                  </Link>
                ) : (
                  <div className="font-medium text-gray-700">{r.title}</div>
                )}
                <div className="text-xs text-gray-500 mt-0.5 space-x-2">
                  {r.target_keyword && (
                    <span>
                      키워드:{" "}
                      <span className="font-mono text-gray-700">
                        {r.target_keyword}
                      </span>
                    </span>
                  )}
                  {r.primary_source_pmid && (
                    <span>
                      주논문 PMID{" "}
                      <span className="font-mono">
                        {r.primary_source_pmid}
                      </span>
                    </span>
                  )}
                </div>
                {r.notes && (
                  <div className="text-xs text-gray-500 mt-0.5">{r.notes}</div>
                )}
              </div>
              <Badge
                variant={
                  r.status === "published"
                    ? "default"
                    : r.status === "draft" || r.status === "review"
                      ? "secondary"
                      : "outline"
                }
                className="shrink-0 mt-0.5"
              >
                {roadmapItemStatusLabel(r.status)}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">
          연결된 콘텐츠 ({contents.length}편)
        </h2>
        <div className="rounded-md border bg-white divide-y">
          {contents.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">
              아직 작성된 글이 없습니다.
            </div>
          )}
          {contents.map((c) => (
            <div
              key={c.id}
              className="px-4 py-3 flex items-center gap-3"
            >
              <Link
                href={`/admin/contents/${c.id}`}
                className="flex-1 min-w-0"
              >
                <div className="font-medium hover:underline truncate">
                  {c.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                  {c.slug}
                </div>
              </Link>
              <div className="text-xs text-gray-500 shrink-0">
                출처 {c.source_ids?.length ?? 0}
              </div>
              <Badge
                variant={c.status === "published" ? "default" : "outline"}
                className="shrink-0"
              >
                {contentStatusLabel(c.status)}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">
          연결된 자료 ({sources.length}건)
        </h2>
        <div className="rounded-md border bg-white divide-y">
          {sources.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">
              연결된 자료가 없습니다.
            </div>
          )}
          {sources.map((s) => (
            <div
              key={s.id}
              className="px-4 py-3 flex items-center gap-3"
            >
              <Badge variant="outline" className="shrink-0">
                {sourceTypeLabel(s.source_type)}
              </Badge>
              <Link
                href={`/admin/sources/${s.id}`}
                className="flex-1 min-w-0 hover:underline truncate"
              >
                {s.title}
              </Link>
              {s.outlet && (
                <span className="text-xs text-gray-500 shrink-0">
                  {s.outlet}
                </span>
              )}
              {s.pmid && (
                <span className="text-xs font-mono text-gray-500 shrink-0">
                  PMID {s.pmid}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
