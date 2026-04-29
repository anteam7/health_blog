import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-gray-600 space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-gray-900">소개</Link>
          <Link href="/disclaimer" className="hover:text-gray-900">의료 면책</Link>
          <Link href="/privacy" className="hover:text-gray-900">개인정보처리방침</Link>
          <Link href="/contact" className="hover:text-gray-900">문의</Link>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
          헬스스캐너는 최신 의료 논문과 신뢰할 수 있는 매체를 기반으로 건강·헬스·다이어트 정보를 정리합니다.
          이 사이트의 모든 콘텐츠는 일반 정보 제공 목적이며, 진단·치료·처방을 대체하지 않습니다.
          개인의 건강 문제는 반드시 의료 전문가와 상담하세요.
        </p>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} 헬스스캐너 · healthscanner.co.kr
        </p>
      </div>
    </footer>
  );
}
