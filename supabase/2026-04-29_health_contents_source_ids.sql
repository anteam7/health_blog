-- health_contents 에 source_ids uuid[] 추가 — 인용된 health_sources 다대다 연결
-- 적용일: 2026-04-29
-- 모델: 한 콘텐츠가 여러 자료를 인용 (보통 3-7개). 단순한 uuid[] + GIN 인덱스로 충분.

ALTER TABLE health_contents
  ADD COLUMN IF NOT EXISTS source_ids UUID[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_health_contents_sources
  ON health_contents USING GIN (source_ids);
