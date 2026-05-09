// 블로그 글 본문 마크다운에서 TOC 추출 + 헤딩 슬러그 생성.
// ReactMarkdown 의 헤딩 id 와 TOC 링크가 동일한 슬러그 알고리즘을 공유해야
// 앵커 점프가 작동한다 — 한 곳(이 파일)에서 정의해서 import 한다.

export interface TocItem {
  level: 2 | 3;
  text: string;
  id: string;
}

// 한글 친화 슬러그 — 영숫자·한글·하이픈만 남김.
// 같은 헤딩이 두 개면 뒤쪽에 -2, -3 ... 접미사 (헬퍼 reuse 보장).
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/`/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ReactMarkdown 의 children(ReactNode) 에서 텍스트만 추출.
// 헤딩 id 부여 시 사용. 객체 → string 재귀 추출.
export function extractText(node: unknown): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in (node as object)) {
    const p = (node as { props?: { children?: unknown } }).props;
    return extractText(p?.children);
  }
  return "";
}

// 마크다운 본문에서 ## (H2), ### (H3) 추출. 코드블록(```...```) 안은 무시.
// 동일 슬러그 충돌 시 -2, -3 접미사 부여 (id 유일성 보장).
export function extractToc(md: string | null | undefined): TocItem[] {
  if (!md) return [];
  const lines = md.split(/\r?\n/);
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let inCode = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    let level: 2 | 3 | null = null;
    let text = "";
    const m2 = line.match(/^##\s+(.+?)\s*#*\s*$/);
    const m3 = line.match(/^###\s+(.+?)\s*#*\s*$/);
    if (m2 && !line.startsWith("###")) {
      level = 2;
      text = m2[1].trim();
    } else if (m3) {
      level = 3;
      text = m3[1].trim();
    }
    if (level === null) continue;
    // 인라인 마크다운(굵게/기울임/링크) 표기 제거 — 텍스트만
    const cleaned = text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // 이미지
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // 링크
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      .replace(/`([^`]+)`/g, "$1");

    const baseId = slugifyHeading(cleaned);
    if (!baseId) continue;
    const count = seen.get(baseId) ?? 0;
    const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
    seen.set(baseId, count + 1);
    items.push({ level, text: cleaned, id });
  }
  return items;
}
