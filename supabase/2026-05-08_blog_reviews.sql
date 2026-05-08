-- 어드민 AI 검토 시스템 (jimscanner 패턴 이식)
--
-- 적용 방법: Supabase 대시보드 → SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
-- 멱등 — 다시 실행해도 중복 생성 없음.

-- ─────────────────────────────────────────────
-- 1) 검토 이력 테이블 (before/after 스냅샷 포함 — revert 용)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_blog_post_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES health_contents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NULL,
  model TEXT NULL,
  perspectives TEXT[] NOT NULL,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NULL,
  title_before TEXT NULL,
  title_after TEXT NULL,
  excerpt_before TEXT NULL,
  excerpt_after TEXT NULL,
  body_md_before TEXT NULL,
  body_md_after TEXT NULL,
  applied BOOLEAN NOT NULL DEFAULT FALSE,
  reverted_at TIMESTAMPTZ NULL,
  grounding_urls TEXT[] NOT NULL DEFAULT '{}'::text[]
);

CREATE INDEX IF NOT EXISTS health_blog_post_reviews_content_id_idx
  ON health_blog_post_reviews(content_id, created_at DESC);

ALTER TABLE health_blog_post_reviews ENABLE ROW LEVEL SECURITY;
-- service_role 만 접근 (anon/authenticated 차단 — 정책 없음)

-- ─────────────────────────────────────────────
-- 2) 사용자 정의 검토 관점 프리셋
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_blog_review_perspectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NULL
);

ALTER TABLE health_blog_review_perspectives ENABLE ROW LEVEL SECURITY;
-- service_role 만 접근

-- ─────────────────────────────────────────────
-- 3) 코멘트 (Supabase 대시보드 가독성용)
-- ─────────────────────────────────────────────
COMMENT ON TABLE health_blog_post_reviews IS
  '어드민 AI 검토 이력 — 관점별 findings + before/after 스냅샷 (revert 가능).';
COMMENT ON TABLE health_blog_review_perspectives IS
  '사용자 정의 검토 관점 프리셋 (디폴트 4개 외에 어드민에서 자유 추가).';
