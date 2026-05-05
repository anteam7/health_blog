import Link from "next/link";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  topicStatusLabel,
  type ClusterRoadmapItem,
  type HealthTopic,
} from "@/lib/topics";

export const dynamic = "force-dynamic";

interface Row extends HealthTopic {
  source_count: number;
  content_total: number;
  content_published: number;
  content_draft: number;
  roadmap_size: number;
}

async function fetchTopics(): Promise<Row[]> {
  const sb = createAdminClient();
  const { data: topics } = await sb
    .from("health_topics")
    .select("*")
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false });
  if (!topics || topics.length === 0) return [];

  const ids = topics.map((t) => t.id);
  const [sources, contents] = await Promise.all([
    sb.from("health_sources").select("topic_id").in("topic_id", ids),
    sb.from("health_contents").select("topic_id, status").in("topic_id", ids),
  ]);

  const sCount: Record<string, number> = {};
  for (const r of sources.data ?? []) {
    if (r.topic_id) sCount[r.topic_id] = (sCount[r.topic_id] ?? 0) + 1;
  }
  const cStat: Record<
    string,
    { total: number; draft: number; published: number }
  > = {};
  for (const r of contents.data ?? []) {
    if (!r.topic_id) continue;
    const x = (cStat[r.topic_id] ??= { total: 0, draft: 0, published: 0 });
    x.total++;
    if (r.status === "draft") x.draft++;
    else if (r.status === "published") x.published++;
  }

  return topics.map((t) => {
    const roadmap = (t.cluster_roadmap ?? []) as ClusterRoadmapItem[];
    return {
      ...(t as HealthTopic),
      cluster_roadmap: roadmap,
      source_count: sCount[t.id] ?? 0,
      content_total: cStat[t.id]?.total ?? 0,
      content_draft: cStat[t.id]?.draft ?? 0,
      content_published: cStat[t.id]?.published ?? 0,
      roadmap_size: roadmap.length,
    };
  });
}

export default async function TopicsListPage() {
  const rows = await fetchTopics();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">토픽 (콘텐츠 클러스터)</h1>
        <p className="text-sm text-gray-500 mt-1">
          시그널·자료를 묶은 주제. 각 토픽은 7±2편의 글 클러스터로 운영합니다.
        </p>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead className="w-24">상태</TableHead>
              <TableHead className="w-16">우선</TableHead>
              <TableHead className="w-20">자료</TableHead>
              <TableHead className="w-56">글 진행</TableHead>
              <TableHead className="w-44">키워드</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-sm text-gray-500 py-10"
                >
                  토픽이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => {
              const total = r.roadmap_size;
              const pct =
                total > 0 ? Math.round((r.content_published / total) * 100) : 0;
              return (
                <TableRow key={r.id} className="hover:bg-gray-50 align-top">
                  <TableCell>
                    <Link
                      href={`/admin/topics/${r.id}`}
                      className="font-medium hover:underline"
                    >
                      {r.title}
                    </Link>
                    {r.description && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {r.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === "in_progress" ? "default" : "outline"
                      }
                    >
                      {topicStatusLabel(r.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.priority ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">{r.source_count}</TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-600">
                      발행 {r.content_published} · 초안 {r.content_draft} /
                      계획 {total}
                    </div>
                    <div className="mt-1 h-1.5 rounded bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 truncate max-w-[11rem]">
                    {r.keywords?.slice(0, 4).join(" · ") ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
