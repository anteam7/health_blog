import Link from "next/link";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import { buttonVariants } from "@/components/ui/button";
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
  sourceStatusLabel,
  sourceTypeLabel,
  type HealthSource,
} from "@/lib/sources";
import SourcesFilters from "./SourcesFilters";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  type?: string;
  q?: string;
}

async function fetchSources(p: SearchParams): Promise<HealthSource[]> {
  const sb = createAdminClient();
  let q = sb
    .from("health_sources")
    .select("*")
    .order("collected_at", { ascending: false })
    .limit(200);
  if (p.status) q = q.eq("status", p.status);
  if (p.type) q = q.eq("source_type", p.type);
  if (p.q) q = q.ilike("title", `%${p.q}%`);
  const { data } = await q;
  return (data ?? []) as HealthSource[];
}

export default async function SourcesListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const rows = await fetchSources(sp);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">자료 수집</h1>
          <p className="text-sm text-gray-500 mt-1">
            논문·뉴스·가이드라인 등 블로그 글의 근거가 될 자료를 모읍니다.
          </p>
        </div>
        <Link href="/admin/sources/new" className={buttonVariants()}>
          + 새 자료 추가
        </Link>
      </div>

      <SourcesFilters initial={sp} />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">유형</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-40">매체</TableHead>
              <TableHead className="w-28">발행일</TableHead>
              <TableHead className="w-24">평점</TableHead>
              <TableHead className="w-28">상태</TableHead>
              <TableHead className="w-32">수집일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-10">
                  수집된 자료가 없습니다. 우측 상단에서 새 자료를 추가하세요.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id} className="hover:bg-gray-50">
                <TableCell>
                  <Badge variant="outline">{sourceTypeLabel(r.source_type)}</Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/sources/${r.id}`}
                    className="font-medium hover:underline"
                  >
                    {r.title}
                  </Link>
                  {r.topics && r.topics.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {r.topics.join(" · ")}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600 truncate">
                  {r.outlet ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {r.published_date ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {r.quality_score ? `${r.quality_score} / 5` : "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {new Date(r.collected_at).toLocaleDateString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = (
    status === "used"
      ? "default"
      : status === "reviewed"
        ? "secondary"
        : status === "archived"
          ? "outline"
          : "outline"
  ) as "default" | "secondary" | "outline";
  return <Badge variant={variant}>{sourceStatusLabel(status)}</Badge>;
}
