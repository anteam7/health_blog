-- =============================================
-- health_blog 초기 스키마 (짐스캐너와 동일 Supabase 공유)
-- 모든 테이블에 health_ 접두사로 네임스페이스 격리
-- 작성일: 2026-04-29
-- =============================================

-- ─────────────────────────────────────────────
-- 제품 마스터 (영양제/건강기능식품)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  ingredients TEXT[],
  benefits TEXT[],
  cautions TEXT[],
  image_url VARCHAR(300),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_products_slug ON health_products(slug);
CREATE INDEX IF NOT EXISTS idx_health_products_category ON health_products(category);

-- ─────────────────────────────────────────────
-- 가격 / 판매처 비교
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES health_products(id) ON DELETE CASCADE,
  vendor VARCHAR(100) NOT NULL,         -- 쿠팡, 아이허브, 11번가 등
  vendor_url VARCHAR(500),
  price_krw INTEGER,
  price_usd NUMERIC(8,2),
  shipping_krw INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_product_prices_product ON health_product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_health_product_prices_vendor ON health_product_prices(vendor);

-- ─────────────────────────────────────────────
-- 콘텐츠 (블로그/가이드)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  body_md TEXT,                          -- 마크다운 본문
  excerpt VARCHAR(500),                  -- 발췌 (목록/SEO 디스크립션 용)
  cover_image_url VARCHAR(500),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'draft',    -- draft | review | published
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_contents_slug ON health_contents(slug);
CREATE INDEX IF NOT EXISTS idx_health_contents_status ON health_contents(status);
CREATE INDEX IF NOT EXISTS idx_health_contents_published ON health_contents(published_at DESC);

-- 인용된 자료 (다대다, 마이그레이션: 2026-04-29_health_contents_source_ids.sql)
ALTER TABLE health_contents
  ADD COLUMN IF NOT EXISTS source_ids UUID[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_health_contents_sources ON health_contents USING GIN (source_ids);

-- AdSense 메타 컬럼 (마이그레이션: 2026-05-09_health_contents_meta.sql)
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

-- ─────────────────────────────────────────────
-- 관리자 액션 로그
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_admin_actions (
  id BIGSERIAL PRIMARY KEY,
  actor_email VARCHAR(200) NOT NULL,
  action VARCHAR(80) NOT NULL,           -- 'create_product', 'publish_content' 등
  target_type VARCHAR(50),
  target_id VARCHAR(100),
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_admin_actions_created ON health_admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_admin_actions_actor ON health_admin_actions(actor_email);

-- ─────────────────────────────────────────────
-- RLS 정책 (공개 테이블에 SELECT 허용 — anon 키 0 rows 함정 회피)
-- ─────────────────────────────────────────────
ALTER TABLE health_products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_contents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_admin_actions  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_products read"       ON health_products;
DROP POLICY IF EXISTS "health_product_prices read" ON health_product_prices;
DROP POLICY IF EXISTS "health_contents read"       ON health_contents;

CREATE POLICY "health_products read"       ON health_products       FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "health_product_prices read" ON health_product_prices FOR SELECT TO anon USING (true);
CREATE POLICY "health_contents read"       ON health_contents       FOR SELECT TO anon USING (status = 'published');

-- health_admin_actions 는 anon 차단 — service_role 만 INSERT/SELECT 가능

-- ─────────────────────────────────────────────
-- 자료 수집 (논문·뉴스 등) — 콘텐츠 작성 전 수집 단계
-- (마이그레이션: 2026-04-29_health_sources.sql 와 동일 — 단일 소스 유지용 통합)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(20) NOT NULL,         -- paper | news | guideline | video | other
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  doi VARCHAR(200),
  pmid VARCHAR(50),
  authors TEXT[],
  outlet VARCHAR(200),
  published_date DATE,
  abstract TEXT,
  key_findings TEXT,
  topics TEXT[],
  quality_score SMALLINT CHECK (quality_score BETWEEN 1 AND 5),
  status VARCHAR(20) NOT NULL DEFAULT 'collected', -- collected | reviewed | used | archived
  linked_content_id UUID REFERENCES health_contents(id) ON DELETE SET NULL,
  notes TEXT,
  collected_by VARCHAR(200),
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_sources_status     ON health_sources(status);
CREATE INDEX IF NOT EXISTS idx_health_sources_type       ON health_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_health_sources_collected  ON health_sources(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_sources_topics     ON health_sources USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_health_sources_linked     ON health_sources(linked_content_id);

-- ─────────────────────────────────────────────
-- 토픽 (콘텐츠 클러스터) — 시그널→토픽→글 로드맵→콘텐츠 4계층의 1급 시민
-- 마이그레이션: 2026-05-02_health_topics.sql
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  keywords TEXT[],
  status VARCHAR(20) NOT NULL DEFAULT 'candidate',  -- candidate | planned | in_progress | completed | archived
  priority SMALLINT DEFAULT 3,
  cluster_roadmap JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_topics_status   ON health_topics(status);
CREATE INDEX IF NOT EXISTS idx_health_topics_priority ON health_topics(priority DESC);
CREATE INDEX IF NOT EXISTS idx_health_topics_keywords ON health_topics USING GIN (keywords);

CREATE OR REPLACE FUNCTION health_topics_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_health_topics_updated_at ON health_topics;
CREATE TRIGGER trg_health_topics_updated_at
  BEFORE UPDATE ON health_topics
  FOR EACH ROW EXECUTE FUNCTION health_topics_set_updated_at();

ALTER TABLE health_topics ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon 차단 (어드민 service_role 전용)

-- 기존 테이블에 단일 주 토픽 FK
ALTER TABLE health_contents
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES health_topics(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_health_contents_topic ON health_contents(topic_id);

ALTER TABLE health_sources
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES health_topics(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_health_sources_topic ON health_sources(topic_id);

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

ALTER TABLE health_sources ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon 차단. service_role 만 접근.
