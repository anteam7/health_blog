import Link from "next/link";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getCounts() {
  const sb = createAdminClient();
  const [sources, contents, topics] = await Promise.all([
    sb.from("health_sources").select("id, status", { count: "exact", head: false }),
    sb.from("health_contents").select("id, status", { count: "exact", head: false }),
    sb.from("health_topics").select("id, status", { count: "exact", head: false }),
  ]);
  return {
    sourcesTotal: sources.count ?? 0,
    sourcesByStatus: countByStatus(sources.data),
    contentsTotal: contents.count ?? 0,
    contentsByStatus: countByStatus(contents.data),
    topicsTotal: topics.count ?? 0,
    topicsByStatus: countByStatus(topics.data),
  };
}

function countByStatus(rows: { status: string | null }[] | null): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of rows ?? []) {
    const k = r.status ?? "unknown";
    m[k] = (m[k] ?? 0) + 1;
  }
  return m;
}

export default async function DashboardHome() {
  const c = await getCounts();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">
          자료 수집 → 검토 → 콘텐츠 작성 → 발행 워크플로 현황
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Link href="/admin/topics" className="hover:underline">
                토픽 (클러스터)
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{c.topicsTotal}</div>
            <div className="text-xs text-gray-500 mt-2 space-x-3">
              {Object.entries(c.topicsByStatus).map(([k, v]) => (
                <span key={k}>
                  {k}: <b>{v}</b>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Link href="/admin/contents" className="hover:underline">
                콘텐츠
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{c.contentsTotal}</div>
            <div className="text-xs text-gray-500 mt-2 space-x-3">
              {Object.entries(c.contentsByStatus).map(([k, v]) => (
                <span key={k}>
                  {k}: <b>{v}</b>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Link href="/admin/sources" className="hover:underline">
                자료 (논문·뉴스)
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{c.sourcesTotal}</div>
            <div className="text-xs text-gray-500 mt-2 space-x-3">
              {Object.entries(c.sourcesByStatus).map(([k, v]) => (
                <span key={k}>
                  {k}: <b>{v}</b>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
