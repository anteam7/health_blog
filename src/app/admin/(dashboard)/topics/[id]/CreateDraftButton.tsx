"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  topicId: string;
  order: number;
  title: string;
};

export default function CreateDraftButton({ topicId, order, title }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleClick() {
    if (
      !confirm(
        `"${title}" — 이 항목으로 빈 draft 글을 만들고 어드민 편집 화면으로 이동합니다. 계속할까요?`,
      )
    ) {
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/admin/topics/${topicId}/roadmap/draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        // 이미 글이 있으면 그 글로 이동 (편의)
        if (res.status === 409 && data.existing_content_id) {
          router.push(`/admin/contents/${data.existing_content_id}`);
          return;
        }
        throw new Error(data?.error ?? "draft 생성 실패");
      }
      router.push(`/admin/contents/${data.content_id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "오류");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleClick}
        disabled={busy}
        className="text-xs"
      >
        {busy ? "생성 중…" : "+ draft 만들기"}
      </Button>
      {err && (
        <span className="text-[11px] text-red-600 max-w-[200px] text-right">
          {err}
        </span>
      )}
    </div>
  );
}
