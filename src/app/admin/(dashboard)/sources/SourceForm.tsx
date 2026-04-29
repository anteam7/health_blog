"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  SOURCE_STATUSES,
  SOURCE_TYPES,
  type HealthSource,
} from "@/lib/sources";

interface FormState {
  source_type: string;
  title: string;
  url: string;
  doi: string;
  pmid: string;
  authors: string;
  outlet: string;
  published_date: string;
  abstract: string;
  key_findings: string;
  topics: string;
  quality_score: string;
  status: string;
  notes: string;
}

function fromRow(r: HealthSource | null): FormState {
  return {
    source_type: r?.source_type ?? "paper",
    title: r?.title ?? "",
    url: r?.url ?? "",
    doi: r?.doi ?? "",
    pmid: r?.pmid ?? "",
    authors: (r?.authors ?? []).join(", "),
    outlet: r?.outlet ?? "",
    published_date: r?.published_date ?? "",
    abstract: r?.abstract ?? "",
    key_findings: r?.key_findings ?? "",
    topics: (r?.topics ?? []).join(", "),
    quality_score: r?.quality_score ? String(r.quality_score) : "",
    status: r?.status ?? "collected",
    notes: r?.notes ?? "",
  };
}

export default function SourceForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial: HealthSource | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(fromRow(initial));
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setState((s) => ({ ...s, [k]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!state.title.trim()) return setErr("제목은 필수입니다.");
    if (!state.url.trim()) return setErr("URL은 필수입니다.");

    const payload = {
      ...state,
      authors: state.authors,
      topics: state.topics,
      quality_score: state.quality_score === "" ? null : Number(state.quality_score),
    };

    start(async () => {
      const url =
        mode === "create"
          ? "/api/admin/sources"
          : `/api/admin/sources/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error ?? `${res.status} 오류`);
        return;
      }
      router.push("/admin/sources");
      router.refresh();
    });
  }

  async function handleDelete() {
    if (mode !== "edit" || !initial) return;
    if (!confirm("이 자료를 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    start(async () => {
      const res = await fetch(`/api/admin/sources/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error ?? `${res.status} 오류`);
        return;
      }
      router.push("/admin/sources");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="유형">
          <select
            value={state.source_type}
            onChange={(e) => set("source_type", e.target.value)}
            className="h-9 border rounded-md px-2 text-sm bg-white w-full"
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="상태">
          <select
            value={state.status}
            onChange={(e) => set("status", e.target.value)}
            className="h-9 border rounded-md px-2 text-sm bg-white w-full"
          >
            {SOURCE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="제목 *">
        <Input
          value={state.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </Field>

      <Field label="URL *">
        <Input
          type="url"
          value={state.url}
          onChange={(e) => set("url", e.target.value)}
          required
          placeholder="https://..."
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="DOI">
          <Input
            value={state.doi}
            onChange={(e) => set("doi", e.target.value)}
            placeholder="10.1234/..."
          />
        </Field>
        <Field label="PMID">
          <Input
            value={state.pmid}
            onChange={(e) => set("pmid", e.target.value)}
            placeholder="12345678"
          />
        </Field>
        <Field label="발행일">
          <Input
            type="date"
            value={state.published_date}
            onChange={(e) => set("published_date", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="매체 / 저널" hint="Nature, JAMA, NYT 등">
          <Input
            value={state.outlet}
            onChange={(e) => set("outlet", e.target.value)}
          />
        </Field>
        <Field label="신뢰도 (1-5)">
          <Input
            type="number"
            min={1}
            max={5}
            value={state.quality_score}
            onChange={(e) => set("quality_score", e.target.value)}
          />
        </Field>
      </div>

      <Field label="저자" hint="콤마로 구분 (예: Kim S, Lee J)">
        <Input
          value={state.authors}
          onChange={(e) => set("authors", e.target.value)}
        />
      </Field>

      <Field label="주제 태그" hint="콤마로 구분 (예: 다이어트, 근력, 심혈관)">
        <Input
          value={state.topics}
          onChange={(e) => set("topics", e.target.value)}
        />
      </Field>

      <Field label="초록 (Abstract)">
        <Textarea
          value={state.abstract}
          onChange={(e) => set("abstract", e.target.value)}
          rows={6}
          placeholder="원문 초록 또는 기사 핵심 단락"
        />
      </Field>

      <Field
        label="핵심 발견 (한국어 정리)"
        hint="블로그 글 작성 시 쓸 수 있는 한국어 요약"
      >
        <Textarea
          value={state.key_findings}
          onChange={(e) => set("key_findings", e.target.value)}
          rows={5}
        />
      </Field>

      <Field label="메모">
        <Textarea
          value={state.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
        />
      </Field>

      {err && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : mode === "create" ? "추가" : "저장"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/sources")}
          disabled={pending}
        >
          취소
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            onClick={handleDelete}
            disabled={pending}
          >
            삭제
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
