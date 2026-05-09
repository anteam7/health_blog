interface Props {
  badge: string;
  title: string;
  description?: string;
  effectiveDate?: string;
}

// 정책 페이지 5종(privacy/terms/about/disclaimer/contact) 공통 Hero.
// 권위감 있는 건강 매체 톤 — 헤더 일관성.
export default function PolicyHero({
  badge,
  title,
  description,
  effectiveDate,
}: Props) {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 ring-1 ring-inset ring-teal-200">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden />
          {badge}
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
        {effectiveDate && (
          <p className="mt-5 text-sm text-gray-500">
            시행일: <span className="text-gray-700">{effectiveDate}</span>
          </p>
        )}
      </div>
    </section>
  );
}
