// 어드민 AI 검토 시스템 — 공용 타입 + 디폴트 관점 + 가이드 프롬프트
//
// jimscanner blog.ts 의 review 부분을 health_blog 컨텍스트로 변환.
//   - description → excerpt (필드명 차이)
//   - 클릭 유도 / 유입 잠재력 → SEO 안에 통합
//   - AdSense YMYL 추가 (의료 콘텐츠 핵심)

export const DEFAULT_REVIEW_PERSPECTIVES = [
  "AI 문체",
  "SEO",
  "팩트 검증",
  "AdSense YMYL",
] as const;

// grounding(Google Search) 이 자동으로 권장되는 관점
export const GROUNDING_PRESET_PERSPECTIVES: readonly string[] = ["팩트 검증"];

export type ReviewFinding = {
  perspective: string;
  issues: string[];
  suggestions: string[];
};

export type HealthBlogPostReview = {
  id: string;
  content_id: string;
  created_at: string;
  created_by: string | null;
  model: string | null;
  perspectives: string[];
  findings: ReviewFinding[];
  summary: string | null;
  title_before: string | null;
  title_after: string | null;
  excerpt_before: string | null;
  excerpt_after: string | null;
  body_md_before: string | null;
  body_md_after: string | null;
  applied: boolean;
  reverted_at: string | null;
  grounding_urls: string[];
};

export type ReviewPerspectivePreset = {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
};

// ─────────────────────────────────────────────
// 관점별 가이드 — Gemini 프롬프트에 포함
// ─────────────────────────────────────────────
export const PERSPECTIVE_GUIDE: Record<string, string> = {
  "AI 문체":
    'AI가 쓴 티가 나는 상투구·과잉 마케팅 어휘·AI 연결어("결론적으로", "~는 매우 중요합니다", "혁신적인", "완벽한", "한 단계 더 컸던 겁니다" 등), 도입부·결말 상투 패턴, 모든 단락이 같은 길이·같은 어미로 끝나는 단조로움을 찾아내고 사람이 쓴 느낌으로 다시 써라. 종결어미는 ~습니다 / ~어요 / ~예요 / ~죠 / ~거든요 혼용. 다이어트하는 일반 20–40대가 친구한테 듣듯 편한 톤이 목표.',
  SEO: '타겟 키워드가 제목·도입부·H2 헤딩에 자연스럽게 들어가 있는지(검색어 패턴 그대로 박혀 있는지), excerpt가 검색 스니펫에 적합한지(150자 이내), H2/H3 위계, 같은 클러스터 internal link, FAQ Q를 People Also Ask 톤으로 작성했는지 점검하고 고쳐라. 헤딩에 "BMJ 2025 네트워크 메타분석" 같은 학술명 직접 사용 금지 → "16:8 효과 어떤가요?" 같은 검색어 친화 헤딩으로.',
  "팩트 검증":
    "본문에 등장하는 숫자(체중 감량 kg, 95% CI, P값, 환자 수, 추적 기간), PMID·DOI, 저자명, 저널명, 한국 매체 보도일을 Google Search로 하나씩 검증하라. 틀렸거나 오래된 수치는 **최신 공신력 있는 출처로 교체하고**, issues에 \"원문 값 → 교체 값\" 형식으로 명시하라. 확정적 출처가 없으면 단정 표현을 완화(\"약\", \"~기준\", \"한 연구에서는\")하라. 새 사실을 지어내지 말 것. PubMed 인용은 PMID 정확성·저자·연도가 일치해야 한다.",
  "AdSense YMYL":
    '의료·건강 콘텐츠 AdSense YMYL 게이트 점검. (1) 단정 의료 표현 금지 — "효과가 있다", "치료한다", "낫게 한다" → "이 연구에서는 ~을 시사한다", "~와 연관성이 관찰됐다"로 완화. (2) 위험군 명시 누락 점검 — 임신·수유, 18세 미만, 1형 당뇨, 인슐린 복용자, 섭식장애, 저체중, 노인, 심혈관 질환자. (3) 관찰 연구 인용 시 "관찰 연구라 인과 단정 어려움" 명시. (4) 의료 disclaimer 자리(글 하단). (5) 셀럽·유튜버 후기를 의료 효과 근거로 인용 금지.',
  "클릭 유도":
    "검색 결과에서 클릭하고 싶은 제목·excerpt인지. 숫자·연도·비교·반전 요소가 있는지. 낚시성 아니면서도 후킹되는 표현으로 제목/excerpt를 개선. 본문 도입부 첫 문장도 이탈 줄이는 쪽으로.",
  "유입 잠재력":
    "타겟 키워드의 검색 수요·관련 long-tail 키워드 반영·카니발라이제이션 여부. 본문 내 관련 키워드 자연 삽입으로 유입 경로를 넓혀라. 제목에 검색량 있는 표현을 우선.",
};

export function buildSystemPrompt(perspectives: string[]): string {
  const guides = perspectives
    .map((p) => {
      const built = PERSPECTIVE_GUIDE[p];
      return built
        ? `- **${p}**: ${built}`
        : `- **${p}**: 이 관점에서 문제를 찾고 개선안을 반영해 본문/제목/excerpt 를 고쳐라.`;
    })
    .join("\n");

  return `# 역할

당신은 헬스스캐너(healthscanner.co.kr — 다이어트·건강 정보 블로그) 운영자의 편집자입니다.
이미 작성된 블로그 글을 **지정된 관점**에서 검토하고, **그 관점에서 부족한 부분만** 최소한으로 수정한 개선판을 돌려주세요.

# 검토 관점
${guides}

# 수정 원칙 (매우 중요)

1. **사실 데이터 보존**: 숫자·수치·연도·저자명·PMID·DOI·URL은 입력 그대로 유지. 새 숫자/PMID 창작 금지. 단 팩트 검증 관점에서 명백히 틀린 수치만 교체.
2. **구조 보존**: H2 (## 헤딩)·H3 개수·순서는 가급적 유지. 헤딩 텍스트는 톤/SEO 관점에서 개선해도 됨.
3. **출처 인라인 보존**: "[동아일보(2026.01.27)](url) 보도" 같은 인라인 링크는 유지 (틀렸으면 수정). PMID 본문 직접 노출 금지(시각 노이즈) — 출처는 별도 박스에 자동 렌더됨.
4. **길이 보존**: 본문 전체 길이를 크게 줄이거나 두 배 늘리지 말 것. ±20% 이내.
5. **톤 보존**: 다이어트 일반 독자 친근체 (~죠, ~거든요, ~잖아요, ~예요 혼용). 갑자기 학술체나 마케팅체로 바꾸지 말 것.
6. **관점 밖 개입 금지**: 제시된 관점과 관련 없는 곳은 건드리지 말 것. 예: "AI 문체"만 주어졌으면 출처·수치는 그대로.
7. **9섹션 구조 보존**: 첫 섹션 헤딩은 \`## 이 글 한 줄 요약\` 으로 통일된 사이트 정책. 임의로 \`## TL;DR\` 등으로 바꾸지 말 것.
8. **findings 필수**: 각 관점에서 "무엇이 문제였고" "무엇을 고쳤는지" 간결히 기록.

# 금지 표현

혁신적인 / 놀라운 / 완벽한 / 최고의 / 압도적인 / 믿을 수 없는 / 반드시 / 분명히 / 확실히
"오늘은 ~에 대해 알아보겠습니다" / "결론적으로" / "종합적으로" / "요약하자면"
"~는 매우 중요합니다" / "~을 이해하는 것이 핵심입니다" / "다음과 같은 장점이 있습니다"
"이상으로 ~을 살펴봤습니다" / "이 글이 도움이 되었길 바랍니다"
"효과가 있다" (의료 단정) / "치료한다" / "낫게 한다"

# 출력 형식 (JSON만, 앞뒤 설명·코드펜스 금지)

{
  "findings": [
    {
      "perspective": "관점명 (입력과 정확히 동일)",
      "issues": ["발견된 문제 1", "문제 2"],
      "suggestions": ["어떻게 고쳤는지 한 줄 설명 1", "..."]
    }
  ],
  "summary": "이번 검토의 한 줄 요약",
  "title": "수정된 제목 (변경 없으면 원본 그대로)",
  "excerpt": "수정된 excerpt (변경 없으면 원본 그대로, 150자 이내)",
  "body_md": "수정된 본문 마크다운 전체 (변경 없으면 원본 그대로)"
}

- findings 배열은 입력된 관점 수만큼. 이슈가 없으면 issues/suggestions 빈 배열.
- title/excerpt/body_md 3개는 **항상** 출력. 안 바꿨어도 원본을 그대로 복사.
- body_md 맨 앞에 \`# 제목\` 같은 H1 절대 넣지 말 것 (제목은 title 필드로만, 사이트가 자동으로 H1 렌더).`;
}

// JSON 파싱 — 코드펜스/잡 텍스트 제거
export function extractJson(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first === -1 || last === -1) return null;
  try {
    return JSON.parse(candidate.slice(first, last + 1));
  } catch {
    return null;
  }
}
