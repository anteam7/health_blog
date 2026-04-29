"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SOURCE_STATUSES, SOURCE_TYPES } from "@/lib/sources";

export default function SourcesFilters({
  initial,
}: {
  initial: { status?: string; type?: string; q?: string };
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(initial.q ?? "");
  const status = initial.status ?? "";
  const type = initial.type ?? "";

  function update(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    }
    start(() => {
      router.push(`/admin/sources?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border rounded-md px-3 py-2">
      <select
        value={type}
        onChange={(e) => update({ type: e.target.value || undefined })}
        className="text-sm border rounded-md px-2 py-1.5 bg-white"
      >
        <option value="">전체 유형</option>
        {SOURCE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => update({ status: e.target.value || undefined })}
        className="text-sm border rounded-md px-2 py-1.5 bg-white"
      >
        <option value="">전체 상태</option>
        {SOURCE_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <form
        className="flex items-center gap-2 ml-auto"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q || undefined });
        }}
      >
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목 검색"
          className="w-56 h-9"
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          검색
        </Button>
      </form>
    </div>
  );
}
