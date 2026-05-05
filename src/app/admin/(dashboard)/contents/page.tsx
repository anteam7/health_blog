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
import { contentStatusLabel, type HealthContent } from "@/lib/contents";

export const dynamic = "force-dynamic";

interface Row extends HealthContent {
  topic_title: string | null;
}

async function fetchContents(): Promise<Row[]> {
  const sb = createAdminClient();
  const { data: contents } = await sb
    .from("health_contents")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (!contents || contents.length === 0) return [];

  const topicIds = [
    ...new Set(contents.map((c) => c.topic_id).filter(Boolean)),
  ] as string[];
  const titleMap: Record<string, string> = {};
  if (topicIds.length > 0) {
    const { data: topics } = await sb
      .from("health_topics")
      .select("id, title")
      .in("id", topicIds);
    for (const t of topics ?? []) titleMap[t.id] = t.title;
  }

  return contents.map((c) => ({
    ...(c as HealthContent),
    topic_title: c.topic_id ? (titleMap[c.topic_id] ?? null) : null,
  }));
}

export default async function ContentsListPage() {
  const rows = await fetchContents();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">콘텐츠</h1>
        <p className="text-sm text-gray-500 mt-1">
          블로그 글 (초안·검토·발행). 토픽 클러스터에 연결된 글을 관리합니다.
        </p>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead className="w-32">토픽</TableHead>
              <TableHead className="w-20">상태</TableHead>
              <TableHead className="w-20">출처</TableHead>
              <TableHead className="w-32">수정일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-gray-500 py-10"
                >
                  글이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id} className="hover:bg-gray-50 align-top">
                <TableCell>
                  <Link
                    href={`/admin/contents/${r.id}`}
                    className="font-medium hover:underline"
                  >
                    {r.title}
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5 font-mono truncate max-w-md">
                    {r.slug}
                  </div>
                  {r.excerpt && (
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xl">
                      {r.excerpt}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {r.topic_id && r.topic_title ? (
                    <Link
                      href={`/admin/topics/${r.topic_id}`}
                      className="text-gray-700 hover:underline"
                    >
                      {r.topic_title}
                    </Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      r.status === "published" ? "default" : "outline"
                    }
                  >
                    {contentStatusLabel(r.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {r.source_ids?.length ?? 0}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {new Date(r.updated_at).toLocaleDateString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
