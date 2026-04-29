-- health_sources : 블로그 글 작성을 위한 자료 수집 테이블
-- 적용일: 2026-04-29
-- 의존: health_contents (linked_content_id FK)

CREATE TABLE IF NOT EXISTS health_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(20) NOT NULL,         -- paper | news | guideline | video | other
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  doi VARCHAR(200),
  pmid VARCHAR(50),
  authors TEXT[],
  outlet VARCHAR(200),                      -- 매체/저널명: Nature, JAMA, NYT 등
  published_date DATE,
  abstract TEXT,                            -- 초록/요약 원문
  key_findings TEXT,                        -- 운영자가 정리한 한국어 핵심
  topics TEXT[],                            -- ['다이어트','근력','심혈관'] 등
  quality_score SMALLINT CHECK (quality_score BETWEEN 1 AND 5),
  status VARCHAR(20) NOT NULL DEFAULT 'collected', -- collected | reviewed | used | archived
  linked_content_id UUID REFERENCES health_contents(id) ON DELETE SET NULL,
  notes TEXT,
  collected_by VARCHAR(200),                -- 운영자 이메일
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_sources_status     ON health_sources(status);
CREATE INDEX IF NOT EXISTS idx_health_sources_type       ON health_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_health_sources_collected  ON health_sources(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_sources_topics     ON health_sources USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_health_sources_linked     ON health_sources(linked_content_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION health_sources_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_health_sources_updated_at ON health_sources;
CREATE TRIGGER trg_health_sources_updated_at
  BEFORE UPDATE ON health_sources
  FOR EACH ROW EXECUTE FUNCTION health_sources_set_updated_at();

-- RLS: 자료는 비공개 (어드민 service_role 만 접근)
ALTER TABLE health_sources ENABLE ROW LEVEL SECURITY;
-- (정책 없음 = anon 차단. service_role 은 RLS 우회)
