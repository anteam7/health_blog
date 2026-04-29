<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# health_blog 작업 사이클 (계획 → 실행 → 리뷰 → 피드백)

이 프로젝트에서 **사소하지 않은 모든 작업**은 4단계 사이클을 따른다. 사이클의 마지막 단계는 다음 사이클이 더 잘 작동하도록 만드는 재귀 개선의 핵심이다.

## 1. 계획 (Plan)

도구 호출 전에 사용자에게 짧게 보여줄 것:
- **목표**: 무엇이 성공인지 한 줄
- **단계**: 번호 매긴 구체적 조치 (어떤 파일/명령/도구)
- **리스크**: 실패할 만한 것 1–3개

기존 피드백 메모리(`memory/feedback_*.md`)를 먼저 훑어 같은 함정을 반복하지 않는다.

## 2. 실행 (Execute)

계획대로 도구를 호출한다. 계획에서 벗어나야 하면 **왜** 벗어나는지 한 줄로 사용자에게 알린다 (침묵 변경 금지).

## 3. 리뷰 (Review)

실행 직후 자체 점검:
- 각 단계가 의도한 결과를 냈는가?
- 예상 못 한 것(에러/잘못된 가정/숨겨진 제약)이 있었는가?
- 빠뜨리거나 순서가 바뀐 것이 있는가?

## 4. 피드백 (Feedback) — **재귀 개선 엔진**

리뷰에서 얻은 **다음 세션도 알아야 할** 교훈만 추려 영구 메모리에 저장한다. 사소한 일회성 사실은 저장하지 않는다.

**저장 위치**: `C:\Users\안승혁\.claude\projects\C--Web-healthpill\memory\feedback_<topic>.md`

**저장 포맷**:
```markdown
---
name: <짧은 이름>
description: <한 줄 설명 — 미래의 자기가 관련성을 판단할 수 있게 구체적으로>
type: feedback
---

<규칙 한 문장>

**Why:** <왜 — 보통 실수/사고/검증된 판단의 근거>
**How to apply:** <언제/어디서 적용할지>
```

저장 후 `memory/MEMORY.md`에 한 줄 인덱스 추가.

**무엇을 저장하는가**
- 반복될 만한 함정 (예: "Supabase pooler 비번은 admin 비번과 다름 — `Supabase` 접미사")
- 검증된 비자명한 판단 (예: "테이블에 `health_` 접두사 — 짐스캐너와 충돌 회피")
- 사용자의 명시적 교정 ("X 하지 마라", "Y 그대로 가라")

**저장하지 않는 것**
- 코드/스키마에서 바로 읽을 수 있는 사실
- 일회성 디버깅 결과 (PR 본문/커밋 메시지로 충분)
- "이번에 X 파일 만들었다" 같은 이벤트 로그

## 사이클 적용 기준

- **적용**: 신규 기능, 마이그레이션, 의존성 추가, 설정 변경, 사용자가 새 요구사항 제시
- **건너뜀**: 오타 수정, 1–2줄 코드 변경, 단순 질문 응답
