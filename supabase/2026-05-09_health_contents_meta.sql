-- =============================================
-- health_contents 메타 컬럼 (AdSense 승인 게이트)
-- 작성일: 2026-05-09
--
-- 추가 컬럼:
--   category            : 5종 화이트리스트 (src/lib/categories.ts 와 동기)
--   author_name/credential   : 글 저자 (E-E-A-T)
--   reviewer_name/credential : 의료 검토자 (YMYL 신뢰성)
--   reviewed_at         : 마지막 검토 시각
--   evidence_level      : meta | rct | guideline | review | news
--
-- 모두 NULL 허용 — 기존 글에 영향 없음.
-- 어드민 폼에서 입력 UI 는 후속 사이클.
-- =============================================

ALTER TABLE health_contents
  ADD COLUMN IF NOT EXISTS category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS author_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS author_credential VARCHAR(200),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewer_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS reviewer_credential VARCHAR(200),
  ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_health_contents_category
  ON health_contents(category)
  WHERE category IS NOT NULL;

-- 카테고리 화이트리스트 검증 (DB 레벨 안전망)
-- src/lib/categories.ts 의 BLOG_CATEGORIES.slug 와 일치해야 함.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'health_contents'
      AND constraint_name = 'health_contents_category_check'
  ) THEN
    ALTER TABLE health_contents
      ADD CONSTRAINT health_contents_category_check
      CHECK (
        category IS NULL
        OR category IN (
          'diet',
          'fitness',
          'nutrition',
          'sleep-stress',
          'chronic-prevention'
        )
      );
  END IF;
END$$;

-- evidence_level 도 화이트리스트
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'health_contents'
      AND constraint_name = 'health_contents_evidence_level_check'
  ) THEN
    ALTER TABLE health_contents
      ADD CONSTRAINT health_contents_evidence_level_check
      CHECK (
        evidence_level IS NULL
        OR evidence_level IN ('meta', 'rct', 'guideline', 'review', 'news')
      );
  END IF;
END$$;
