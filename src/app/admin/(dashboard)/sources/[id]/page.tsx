import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import { type HealthSource } from "@/lib/sources";
import SourceForm from "../SourceForm";

export const dynamic = "force-dynamic";

export default async function EditSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("health_sources")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/sources"
          className="text-sm text-gray-500 hover:underline"
        >
          ← 자료 목록
        </Link>
        <h1 className="text-2xl font-semibold mt-1">자료 편집</h1>
        <p className="text-xs text-gray-500 mt-1">
          ID: <span className="font-mono">{data.id}</span> · 수집{" "}
          {new Date(data.collected_at).toLocaleString("ko-KR")} · 수정{" "}
          {new Date(data.updated_at).toLocaleString("ko-KR")}
        </p>
      </div>
      <SourceForm mode="edit" initial={data as HealthSource} />
    </div>
  );
}
