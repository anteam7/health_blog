import Link from "next/link";
import { evidenceLabel, getCategoryLabel } from "@/lib/categories";

interface Props {
  authorName: string | null;
  authorCredential: string | null;
  publishedAt: string | null;
  updatedAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
  reviewerCredential: string | null;
  category: string | null;
  evidenceLevel: string | null;
  readingMinutes: number;
}

// 글 상단 byline. 워드프레스 표준 byline + 의료 콘텐츠 메타 칩.
export default function AuthorMeta({
  authorName,
  authorCredential,
  publishedAt,
  updatedAt,
  reviewedAt,
  category,
  evidenceLevel,
  readingMinutes,
}: Props) {
  const fallbackAuthor = "헬스스캐너 편집부";
  const dispAuthor = authorName ?? fallbackAuthor;

  const showUpdated =
    publishedAt &&
    updatedAt &&
    new Date(updatedAt).toDateString() !==
      new Date(publishedAt).toDateString();

  const categoryLabel = category ? getCategoryLabel(category) : null;
  const evLabel = evidenceLevel ? evidenceLabel(evidenceLevel) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2 text-sm text-gray-700 flex-wrap">
        <span className="font-semibold text-gray-900">{dispAuthor}</span>
        {authorCredential && (
          <span className="text-gray-500 text-xs">{authorCredential}</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
        {publishedAt && (
          <time dateTime={publishedAt}>
            {new Date(publishedAt).toLocaleDateString("ko-KR")}
          </time>
        )}
        {showUpdated && (
          <span className="text-gray-400">
            · 수정 {new Date(updatedAt).toLocaleDateString("ko-KR")}
          </span>
        )}
        <span>·</span>
        <span>약 {readingMinutes}분 읽기</span>
        {reviewedAt && (
          <>
            <span>·</span>
            <span className="text-emerald-700">
              검토 {new Date(reviewedAt).toLocaleDateString("ko-KR")}
            </span>
          </>
        )}
      </div>
      {(categoryLabel || evLabel) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoryLabel && category && (
            <Link
              href={`/blog?category=${category}`}
              className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700 hover:border-gray-400"
            >
              {categoryLabel}
            </Link>
          )}
          {evLabel && (
            <span
              className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-800"
              title="이 글의 가장 비중 큰 근거 종류"
            >
              근거: {evLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// 한국어 기준 읽기 시간 추정 — 분당 약 500자(공백 제외)
export function estimateReadingMinutes(md: string | null): number {
  if (!md) return 1;
  const stripped = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]+\]\([^)]*\)/g, "")
    .replace(/[*_#>~|\-]/g, "")
    .replace(/\s+/g, "");
  const minutes = Math.max(1, Math.round(stripped.length / 500));
  return minutes;
}
