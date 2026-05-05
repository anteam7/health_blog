-- =============================================
-- health_topics — 콘텐츠 생산 파이프라인의 1급 시민
-- 시그널 → 토픽 → 글 로드맵 → 발행 콘텐츠 (4계층)
-- 이번 마이그레이션은 토픽 계층 + 기존 contents/sources 에 FK 만 추가
-- 작성일: 2026-05-02
-- =============================================

CREATE TABLE IF NOT EXISTS health_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,            -- 'intermittent-fasting'
  title VARCHAR(200) NOT NULL,                  -- '간헐적 단식'
  description TEXT,
  keywords TEXT[],                              -- 동의어/검색 키워드 (간헐적 단식, 16:8, 5:2, 격일단식, ADF, TRE…)
  status VARCHAR(20) NOT NULL DEFAULT 'candidate',  -- candidate | planned | in_progress | completed | archived
  priority SMALLINT DEFAULT 3,                  -- 1(낮음) ~ 5(최우선)
  cluster_roadmap JSONB DEFAULT '[]'::jsonb,    -- [{order, title, slug, target_keyword, primary_source_pmid, status, content_id?, notes}]
  metadata JSONB DEFAULT '{}'::jsonb,           -- 자유 필드: 예상 검색량/경쟁도/메모
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_topics_status   ON health_topics(status);
CREATE INDEX IF NOT EXISTS idx_health_topics_priority ON health_topics(priority DESC);
CREATE INDEX IF NOT EXISTS idx_health_topics_keywords ON health_topics USING GIN (keywords);

-- updated_at 트리거
CREATE OR REPLACE FUNCTION health_topics_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_health_topics_updated_at ON health_topics;
CREATE TRIGGER trg_health_topics_updated_at
  BEFORE UPDATE ON health_topics
  FOR EACH ROW EXECUTE FUNCTION health_topics_set_updated_at();

-- RLS: anon 차단, service_role 전용
ALTER TABLE health_topics ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon 차단

-- ─────────────────────────────────────────────
-- 기존 테이블에 FK 추가 (단일 주 토픽). 다대다는 차후.
-- ─────────────────────────────────────────────
ALTER TABLE health_contents
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES health_topics(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_health_contents_topic ON health_contents(topic_id);

ALTER TABLE health_sources
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES health_topics(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_health_sources_topic ON health_sources(topic_id);
