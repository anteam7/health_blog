-- =============================================
-- 간헐적 단식 클러스터 8편 메타 백필 (2026-05-09)
-- category 는 모두 'diet'. evidence_level 은 본문 근거의 가장 큰 비중에 맞춤.
--
-- author/reviewer 는 사용자 본인 정보가 필요하므로 여기선 미설정.
-- 어드민 폼에서 일괄 입력 권장.
-- =============================================

-- 카테고리 일괄
UPDATE health_contents
   SET category = 'diet',
       updated_at = NOW()
 WHERE topic_id = '553d4161-652a-444e-999e-0828f48a508c'
   AND category IS NULL;

-- 근거 강도 (본문 근거 비중 기준)
UPDATE health_contents SET evidence_level = 'meta', updated_at = NOW()
 WHERE slug = 'intermittent-fasting-16-8-vs-calorie-restriction'
   AND evidence_level IS NULL;

UPDATE health_contents SET evidence_level = 'meta', updated_at = NOW()
 WHERE slug = 'intermittent-fasting-5-types-comparison'
   AND evidence_level IS NULL;

UPDATE health_contents SET evidence_level = 'rct', updated_at = NOW()
 WHERE slug = 'intermittent-fasting-adf-deep-dive'
   AND evidence_level IS NULL;

UPDATE health_contents SET evidence_level = 'review', updated_at = NOW()
 WHERE slug = 'intermittent-fasting-autophagy-truth'
   AND evidence_level IS NULL;

UPDATE health_contents SET evidence_level = 'review', updated_at = NOW()
 WHERE slug = 'intermittent-fasting-complete-guide'
   AND evidence_level IS NULL;

UPDATE health_contents SET evidence_level = 'meta', updated_at = NOW()
 WHERE slug = 'intermittent-fasting-fatty-liver'
   AND evidence_level IS NULL;

UPDATE health_contents SET evidence_level = 'rct', updated_at = NOW()
 WHERE slug = 'intermittent-fasting-muscle-loss'
   AND evidence_level IS NULL;

UPDATE health_contents SET evidence_level = 'review', updated_at = NOW()
 WHERE slug = 'intermittent-fasting-side-effects'
   AND evidence_level IS NULL;
