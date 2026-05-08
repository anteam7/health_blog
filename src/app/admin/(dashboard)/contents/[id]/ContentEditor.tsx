"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { contentStatusLabel, type HealthContent } from "@/lib/contents";

type Tab = "content" | "meta" | "preview";

interface SourceCitation {
  id: string;
  source_type: string;
  title: string;
  url: string;
  doi: string | null;
  pmid: string | null;
  outlet: string | null;
  authors: string[] | null;
  published_date: string | null;
}

interface Props {
  initial: HealthContent;
  topicTitle: string | null;
  sources: SourceCitation[];
}

interface EditableState {
  title: string;
  excerpt: string;
  body_md: string;
  tags: string[];
  cover_image_url: string;
  status: HealthContent["status"];
}

function toEditable(p: HealthContent): EditableState {
  return {
    title: p.title ?? "",
    excerpt: p.excerpt ?? "",
    body_md: p.body_md ?? "",
    tags: p.tags ?? [],
    cover_image_url: p.cover_image_url ?? "",
    status: p.status,
  };
}

export default function ContentEditor({ initial, topicTitle, sources }: Props) {
  const router = useRouter();
  const [post, setPost] = useState<HealthContent>(initial);
  const [edit, setEdit] = useState<EditableState>(toEditable(initial));
  const [tab, setTab] = useState<Tab>("content");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<
    { type: "success" | "error" | "info"; text: string } | null
  >(null);

  const chars = useMemo(() => edit.body_md.length, [edit.body_md]);
  const dirty = useMemo(() => {
    const a = JSON.stringify(toEditable(post));
    const b = JSON.stringify(edit);
    return a !== b;
  }, [post, edit]);

  function patch<K extends keyof EditableState>(key: K, value: EditableState[K]) {
    setEdit((s) => ({ ...s, [key]: value }));
  }

  async function api(path: string, method: "PUT" | "POST", body?: unknown) {
    const res = await fetch(`/api/admin/contents/${post.id}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? `요청 실패 (${res.status})`);
    return data;
  }

  async function handleSave(silent = false) {
    setBusy(true);
    setMsg(null);
    try {
      const data = await api("", "PUT", {
        title: edit.title,
        excerpt: edit.excerpt,
        body_md: edit.body_md,
        tags: edit.tags,
        cover_image_url: edit.cover_image_url || null,
      });
      const next = data.row as HealthContent;
      setPost(next);
      setEdit(toEditable(next));
      if (!silent) setMsg({ type: "success", text: "저장됐어요." });
      router.refresh();
    } catch (err) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "저장 실패",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    if (
      !confirm(
        post.status === "published"
          ? "수정 사항을 저장하고 다시 발행 상태로 갱신합니다. 계속할까요?"
          : "발행하면 /blog 에 즉시 노출됩니다. 진행할까요?",
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      // 1) 편집 내용 먼저 저장
      if (dirty) {
        await api("", "PUT", {
          title: edit.title,
          excerpt: edit.excerpt,
          body_md: edit.body_md,
          tags: edit.tags,
          cover_image_url: edit.cover_image_url || null,
        });
      }
      // 2) 상태 전환
      const data = await api("/publish", "POST");
      const next = data.row as HealthContent;
      setPost(next);
      setEdit(toEditable(next));
      setMsg({
        type: "success",
        text: "발행됐어요. /blog 에서 확인 가능합니다.",
      });
      router.refresh();
    } catch (err) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "발행 실패",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleUnpublish() {
    if (!confirm("발행을 취소합니다. 공개 페이지에서 숨겨집니다.")) return;
    setBusy(true);
    setMsg(null);
    try {
      const data = await api("/unpublish", "POST");
      const next = data.row as HealthContent;
      setPost(next);
      setEdit(toEditable(next));
      setMsg({ type: "info", text: "발행이 취소됐습니다." });
      router.refresh();
    } catch (err) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "취소 실패",
      });
    } finally {
      setBusy(false);
    }
  }

  const publicHref =
    post.status === "published" ? `/blog/${post.slug}` : null;

  return (
    <div className="space-y-4">
      {/* 상단 바 */}
      <div className="rounded-md border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant={post.status === "published" ? "default" : "secondary"}
            >
              {contentStatusLabel(post.status)}
            </Badge>
            <span className="text-sm text-gray-600">
              본문 {chars.toLocaleString()}자
            </span>
            {dirty && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                저장 안 함
              </span>
            )}
            {topicTitle && post.topic_id && (
              <a
                href={`/admin/topics/${post.topic_id}`}
                className="text-xs text-gray-500 hover:underline"
              >
                토픽: {topicTitle}
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {publicHref && (
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-700 hover:underline"
              >
                공개 페이지 ↗
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={busy || !dirty}
            >
              저장
            </Button>
            {post.status === "published" ? (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handlePublish}
                  disabled={busy}
                  title="현재 편집 내용 저장 + 발행 갱신"
                >
                  저장 + 발행 갱신
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleUnpublish}
                  disabled={busy}
                >
                  발행 취소
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handlePublish}
                disabled={busy}
              >
                발행
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-mono">{post.slug}</span>
          <span>·</span>
          <span>수정 {new Date(post.updated_at).toLocaleString("ko-KR")}</span>
          {post.published_at && (
            <>
              <span>·</span>
              <span>
                첫 발행 {new Date(post.published_at).toLocaleDateString("ko-KR")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 메시지 */}
      {msg && (
        <div
          className={`rounded-md border px-4 py-2 text-sm ${
            msg.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : msg.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* 탭 */}
      <div className="rounded-md border bg-white p-1 flex gap-1">
        {(["content", "meta", "preview"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
              tab === t
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t === "content"
              ? "본문"
              : t === "meta"
                ? "메타 / SEO"
                : "미리보기"}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <div className="grid lg:grid-cols-2 gap-3">
          <div className="rounded-md border bg-white p-3">
            <p className="text-xs text-gray-500 mb-2">Markdown 본문</p>
            <textarea
              value={edit.body_md}
              onChange={(e) => patch("body_md", e.target.value)}
              className="w-full h-[70vh] resize-none font-mono text-sm border rounded-md p-3 outline-none focus:ring-2 focus:ring-gray-300"
              placeholder={`## TL;DR\n\n- 핵심 결론을 짧게\n\n## 본문 헤딩\n\n본문을 마크다운으로 작성하세요.`}
            />
          </div>
          <div className="rounded-md border bg-white p-4 overflow-auto h-[calc(70vh+2.25rem)]">
            <p className="text-xs text-gray-500 mb-2">실시간 미리보기</p>
            <article className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-a:text-blue-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {edit.body_md || "_본문이 비어 있습니다._"}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      )}

      {tab === "meta" && (
        <div className="rounded-md border bg-white p-5 space-y-5">
          <Field label="제목" hint="공개 페이지 H1, 검색 결과 제목으로 사용">
            <Input
              value={edit.title}
              onChange={(e) => patch("title", e.target.value)}
              placeholder="글 제목"
              className="text-base font-medium"
            />
          </Field>
          <Field
            label="요약 (excerpt)"
            hint="목록 카드·검색 스니펫·OG description 으로 사용. 150자 이내 권장."
          >
            <Textarea
              rows={3}
              value={edit.excerpt}
              onChange={(e) => patch("excerpt", e.target.value)}
              placeholder="이 글이 어떤 내용인지 한두 문장으로"
            />
          </Field>
          <Field label="태그" hint="쉼표로 구분. 예: 간헐적 단식, 5:2, 다이어트">
            <Input
              value={edit.tags.join(", ")}
              onChange={(e) =>
                patch(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
              placeholder="태그1, 태그2"
            />
          </Field>
          <Field
            label="커버 이미지"
            hint="글 상단 hero · 목록 썸네일 · OG 이미지에 사용. Unsplash 무료 검색 / AI 생성 / 직접 URL 입력 중 선택."
          >
            <CoverImagePicker
              contentId={post.id}
              value={edit.cover_image_url}
              onChange={(url) => patch("cover_image_url", url)}
              defaultQuery={post.tags?.[0] || edit.title}
            />
          </Field>
          <Field label="슬러그 (읽기 전용)" hint="URL 경로. 변경하려면 시드 스크립트로.">
            <Input
              value={post.slug}
              disabled
              className="font-mono text-xs text-gray-500"
            />
          </Field>
          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
            <div>출처 자료: {sources.length}건 (시드로 관리)</div>
            <div>
              ID: <span className="font-mono">{post.id}</span>
            </div>
          </div>
        </div>
      )}

      {tab === "preview" && (
        <div className="rounded-md border bg-white px-6 py-6">
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 leading-relaxed">
            <strong>어드민 미리보기</strong>
            {post.status !== "published" &&
              " · 이 글은 아직 발행되지 않았으므로 공개 페이지(/blog)에는 노출되지 않습니다."}
            {dirty &&
              " · 저장 전 편집 내용이 반영되어 있어요 (저장 안 한 상태)."}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-2">
            {edit.title || "(제목 없음)"}
          </h1>
          {edit.excerpt && (
            <p className="text-base text-gray-700 mt-3 leading-relaxed">
              {edit.excerpt}
            </p>
          )}
          {edit.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {edit.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {edit.cover_image_url && (
            <div className="relative w-full aspect-[16/9] mt-6 overflow-hidden rounded-lg bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={edit.cover_image_url}
                alt={edit.title || "cover"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          <article className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-a:text-blue-700 prose-a:underline-offset-2 mt-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: (props) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {edit.body_md ?? ""}
            </ReactMarkdown>
          </article>

          {sources.length > 0 && (
            <section className="mt-10 border-t pt-6">
              <h2 className="text-base font-semibold mb-3">
                출처 ({sources.length})
              </h2>
              <ol className="space-y-3 text-sm">
                {sources.map((s, i) => (
                  <li key={s.id} className="leading-relaxed">
                    <span className="text-gray-500 mr-2">[{i + 1}]</span>
                    {s.authors && s.authors.length > 0 && (
                      <span>
                        {s.authors.slice(0, 3).join(", ")}
                        {s.authors.length > 3 ? " et al." : ""}.{" "}
                      </span>
                    )}
                    <span className="font-medium">{s.title}</span>.{" "}
                    {s.outlet && (
                      <em className="text-gray-700">{s.outlet}</em>
                    )}
                    {s.published_date && (
                      <span className="text-gray-600">
                        , {new Date(s.published_date).getFullYear()}
                      </span>
                    )}
                    .{" "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      {s.source_type === "paper" ? "PubMed" : "원문"}
                    </a>
                    {s.doi && (
                      <>
                        {" · "}
                        <a
                          href={`https://doi.org/${s.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          DOI
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
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
      <label className="text-sm font-medium text-gray-800">{label}</label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}

interface UnsplashSearchPhoto {
  id: string;
  alt: string;
  width: number;
  height: number;
  color: string | null;
  thumb: string;
  small: string;
  raw: string;
  regular: string;
  download_location: string;
  photographer: string;
  photographer_username: string;
  photographer_url: string;
  unsplash_url: string;
}

function CoverImagePicker({
  contentId,
  value,
  onChange,
  defaultQuery,
}: {
  contentId: string;
  value: string;
  onChange: (url: string) => void;
  defaultQuery?: string;
}) {
  const [openPanel, setOpenPanel] = useState<"unsplash" | "ai" | null>(null);

  // Unsplash 검색 상태
  const [query, setQuery] = useState(defaultQuery ?? "");
  const [photos, setPhotos] = useState<UnsplashSearchPhoto[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);

  // AI 생성 상태
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiMsg, setAiMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function search(q: string) {
    if (!q.trim()) return;
    setSearching(true);
    setSearchErr(null);
    try {
      const res = await fetch(
        `/api/admin/unsplash/search?q=${encodeURIComponent(q.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "검색 실패");
      setPhotos((data.results ?? []) as UnsplashSearchPhoto[]);
    } catch (e) {
      setSearchErr(e instanceof Error ? e.message : "검색 실패");
      setPhotos([]);
    } finally {
      setSearching(false);
    }
  }

  async function pickUnsplash(p: UnsplashSearchPhoto) {
    try {
      await fetch("/api/admin/unsplash/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ download_location: p.download_location }),
      });
    } catch {
      // best-effort
    }
    const u = new URL(p.raw);
    u.searchParams.set("w", "1600");
    u.searchParams.set("q", "80");
    u.searchParams.set("fm", "jpg");
    u.searchParams.set("fit", "crop");
    onChange(u.toString());
    setOpenPanel(null);
  }

  async function generateAi() {
    if (
      !confirm(
        "AI(Gemini Nano Banana)로 cover 이미지를 생성합니다. 같은 글이면 기존 cover 가 덮어쓰여요. 30~60초 걸립니다. 계속할까요?",
      )
    )
      return;
    setGenerating(true);
    setAiMsg(null);
    try {
      const res = await fetch(
        `/api/admin/contents/${contentId}/generate-cover`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: aiPrompt.trim() || undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "생성 실패");
      onChange(data.publicUrl as string);
      setAiMsg({
        type: "success",
        text: `✅ 생성 완료 — ${data.modelUsed} · ${data.sizeKB}KB. 저장 버튼을 눌러 확정하세요.`,
      });
    } catch (e) {
      setAiMsg({
        type: "error",
        text: e instanceof Error ? e.message : "생성 실패",
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-3">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="현재 커버"
          className="w-full max-w-md rounded-md border aspect-[16/9] object-cover"
        />
      )}
      <div className="flex gap-2 flex-wrap">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… (직접 URL 입력 가능)"
          className="flex-1 min-w-[200px]"
        />
        <Button
          type="button"
          variant={openPanel === "unsplash" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            setOpenPanel((p) => (p === "unsplash" ? null : "unsplash"))
          }
          className="whitespace-nowrap"
        >
          🔎 Unsplash
        </Button>
        <Button
          type="button"
          variant={openPanel === "ai" ? "default" : "outline"}
          size="sm"
          onClick={() => setOpenPanel((p) => (p === "ai" ? null : "ai"))}
          className="whitespace-nowrap"
        >
          ✨ AI 생성
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange("")}
            className="text-red-700"
          >
            제거
          </Button>
        )}
      </div>

      {openPanel === "unsplash" && (
        <div className="rounded-md border bg-gray-50 p-3 space-y-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  search(query);
                }
              }}
              placeholder="검색어 (예: intermittent fasting, healthy salad, gym)"
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => search(query)}
              disabled={searching || !query.trim()}
            >
              {searching ? "검색 중…" : "검색"}
            </Button>
          </div>

          {searchErr && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
              {searchErr}
            </div>
          )}

          {photos.length === 0 && !searching && !searchErr && (
            <p className="text-xs text-gray-500">
              검색어를 입력하고 Enter 또는 검색 버튼. 영어 검색이 결과가 더 풍부해요.
            </p>
          )}

          {photos.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickUnsplash(p)}
                    className="group relative overflow-hidden rounded-md border bg-white hover:ring-2 hover:ring-blue-500 transition"
                    title={`${p.alt} — ${p.photographer}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.small}
                      alt={p.alt}
                      className="w-full aspect-[16/9] object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-2 py-0.5 opacity-0 group-hover:opacity-100 transition truncate">
                      Photo by {p.photographer}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500">
                Unsplash 무료 사진. 클릭 시 cover URL 자동 채움 + 다운로드 트래킹 호출.
              </p>
            </>
          )}
        </div>
      )}

      {openPanel === "ai" && (
        <div className="rounded-md border bg-purple-50/40 p-3 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">
              커스텀 프롬프트 (선택 — 비우면 글 제목·태그 기반 자동 생성)
            </label>
            <Textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={`영어 권장. 예:\nA clean editorial illustration of an empty plate and clock on warm cream background, 16:9, no text`}
              disabled={generating}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              onClick={generateAi}
              disabled={generating}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {generating ? "생성 중… (30–60초)" : "✨ AI 생성"}
            </Button>
            <span className="text-[11px] text-gray-500">
              Gemini 3.1 Flash Image (Nano Banana 2). Supabase Storage 에 자동 저장.
            </span>
          </div>
          {aiMsg && (
            <div
              className={`text-xs rounded px-3 py-2 border ${
                aiMsg.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {aiMsg.text}
            </div>
          )}
          <p className="text-[11px] text-gray-500">
            한 글당 같은 slug 로 덮어쓰기 됩니다. 마음에 안 들면 다시 생성하시면
            기존 이미지가 교체돼요. 캐시 버스팅 쿼리(?v=…)가 자동으로 붙습니다.
          </p>
        </div>
      )}
    </div>
  );
}
