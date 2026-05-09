interface Props {
  authorName: string | null;
  authorCredential: string | null;
  reviewerName: string | null;
  reviewerCredential: string | null;
  reviewedAt: string | null;
}

// 글 끝 저자/검토자 박스. 워드프레스 author bio 박스 + YMYL medicallyReviewed 합본.
// 저자=검토자 동일하면 한 칸으로 합쳐 표시.
export default function AuthorBox({
  authorName,
  authorCredential,
  reviewerName,
  reviewerCredential,
  reviewedAt,
}: Props) {
  const fallbackAuthor = "헬스스캐너 편집부";
  const dispAuthor = authorName ?? fallbackAuthor;
  const sameAsReviewer =
    reviewerName !== null && reviewerName === authorName;

  const initial = (dispAuthor[0] ?? "헬").toUpperCase();

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="sr-only">이 글에 대해</h2>
      <div className="rounded-lg border bg-gray-50/40 p-5 flex gap-4 items-start">
        <div className="shrink-0 h-12 w-12 rounded-full bg-gray-900 text-white text-base font-semibold flex items-center justify-center">
          {initial}
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{dispAuthor}</span>
              <span className="text-xs text-gray-500">작성</span>
            </div>
            {authorCredential && (
              <p className="mt-0.5 text-xs text-gray-600">{authorCredential}</p>
            )}
          </div>

          {reviewerName && !sameAsReviewer && (
            <div className="pt-1.5 border-t border-gray-200/70">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{reviewerName}</span>
                <span className="text-xs text-emerald-700">의료 검토</span>
              </div>
              {reviewerCredential && (
                <p className="mt-0.5 text-xs text-gray-600">
                  {reviewerCredential}
                </p>
              )}
              {reviewedAt && (
                <p className="mt-0.5 text-xs text-gray-500">
                  검토 일시:{" "}
                  {new Date(reviewedAt).toLocaleDateString("ko-KR")}
                </p>
              )}
            </div>
          )}

          {reviewerName && sameAsReviewer && (
            <p className="text-xs text-gray-600">
              <span className="text-emerald-700 font-medium">의료 검토:</span>{" "}
              {reviewerCredential ?? "운영자 종합 검토"}
              {reviewedAt && (
                <>
                  {" · "}
                  {new Date(reviewedAt).toLocaleDateString("ko-KR")}
                </>
              )}
            </p>
          )}

          <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
            본 글은 일반 정보 제공을 목적으로 합니다. 개인 건강 상태는 의료
            전문가와 상담하세요.
          </p>
        </div>
      </div>
    </section>
  );
}
