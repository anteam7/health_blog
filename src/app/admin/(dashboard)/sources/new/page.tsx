import Link from "next/link";
import SourceForm from "../SourceForm";

export default function NewSourcePage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/sources"
          className="text-sm text-gray-500 hover:underline"
        >
          ← 자료 목록
        </Link>
        <h1 className="text-2xl font-semibold mt-1">새 자료 추가</h1>
      </div>
      <SourceForm mode="create" initial={null} />
    </div>
  );
}
