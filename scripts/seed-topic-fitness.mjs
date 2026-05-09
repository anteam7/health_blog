// "운동·헬스" 토픽 + cluster_roadmap 7편 후보 시드.
// 본문 작성 전 토픽 골격만 박아두고, 첫 글 자료 수집을 별도로 진행.
//
// 동작:
//   1) health_topics 에 'fitness-foundation' upsert (cluster_roadmap 7편 candidate)
//   2) health_admin_actions 감사 로그
// 멱등.
//
// 사용법:  node scripts/seed-topic-fitness.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2];
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {}
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
const ACTOR = "anseunghyok@gmail.com";

const TOPIC = {
  slug: "fitness-foundation",
  title: "운동·헬스 기초",
  description:
    "체지방 감량과 건강한 몸을 만들기 위한 운동의 근거를 정리한다. 근력 vs 유산소, HIIT, 회복, 단백질, 체성분 측정 등 일반 다이어터·운동 입문자가 가장 자주 묻는 주제를 RCT·메타분석 단위로 검증.",
  keywords: [
    "근력 운동",
    "유산소",
    "HIIT",
    "체지방 감량",
    "운동 가이드",
    "단백질 보충제",
    "운동 회복",
    "DOMS",
    "인바디",
    "DEXA",
    "fitness",
    "resistance training",
    "aerobic exercise",
  ],
  status: "in_progress",
  priority: 5,
  cluster_roadmap: [
    {
      order: 1,
      slug: "strength-vs-cardio-fat-loss",
      title: "근력 vs 유산소 — 체지방 감량에 어느 게 더 효과적일까?",
      target_keyword: "근력 운동 유산소 비교",
      primary_source_pmid: null, // 사이클 4 자료 수집 단계에서 채움
      status: "candidate",
      notes:
        "입구 글 — 검색량 큰 비교 키워드, 디스클레임 부담 작음. 메타분석/RCT 우선.",
    },
    {
      order: 2,
      slug: "beginner-strength-routine",
      title: "초보자 근력 운동 시작 — 주 3회 분할 vs 전신 운동",
      target_keyword: "초보자 근력 운동 루틴",
      primary_source_pmid: null,
      status: "candidate",
      notes: "frequency·volume 비교. 초보자 검색량 높음.",
    },
    {
      order: 3,
      slug: "cardio-intensity-hiit-vs-liss",
      title: "HIIT vs LISS — 강도별 유산소 어떤 걸 골라야 할까",
      target_keyword: "HIIT 효과",
      primary_source_pmid: null,
      status: "candidate",
      notes: "시간 효율 vs 지속성 비교. 심혈관·체지방 outcome 메타분석.",
    },
    {
      order: 4,
      slug: "protein-supplement-effectiveness",
      title: "단백질 보충제 효과 — 일반인에게 정말 필요할까?",
      target_keyword: "단백질 보충제 효과",
      primary_source_pmid: null,
      status: "candidate",
      notes:
        "영양·보충제 카테고리지만 운동 클러스터에 cross-link. 효능 단정 X — 메타분석 결론을 conditional 표현.",
    },
    {
      order: 5,
      slug: "exercise-recovery-doms",
      title: "운동 회복 — DOMS·휴식일·수면 관리",
      target_keyword: "운동 후 회복",
      primary_source_pmid: null,
      status: "candidate",
      notes: "오버트레이닝 예방. 수면·스트레스 토픽과 cross-link 가능.",
    },
    {
      order: 6,
      slug: "body-composition-measurement",
      title: "체성분 측정 — 인바디·DEXA·체지방률 어떻게 해석하나",
      target_keyword: "인바디 정확도",
      primary_source_pmid: null,
      status: "candidate",
      notes:
        "측정 정확도 비교 — 일반 다이어터 관심도 높음. BIA 와 DEXA 의 일치도 RCT.",
    },
    {
      order: 7,
      slug: "fitness-complete-guide",
      title: "운동 가이드 — 다이어트와 건강을 위한 근력·유산소 균형 (Pillar)",
      target_keyword: "운동 가이드",
      primary_source_pmid: null,
      status: "candidate",
      notes: "Pillar — 마지막 작성. 1~6편 internal link hub 역할.",
    },
  ],
  metadata: {
    cluster_size: 7,
    pillar_post_order: 7,
    target_search_volume: "high",
    competition: "medium",
    category: "fitness",
    notes: "두 번째 토픽 클러스터. 다이어트(간헐적 단식) 다음 자연스러운 흐름.",
  },
};

async function run() {
  console.log("[1/2] upsert topic", TOPIC.slug);
  const { data: topic, error: topicErr } = await sb
    .from("health_topics")
    .upsert(
      {
        slug: TOPIC.slug,
        title: TOPIC.title,
        description: TOPIC.description,
        keywords: TOPIC.keywords,
        status: TOPIC.status,
        priority: TOPIC.priority,
        cluster_roadmap: TOPIC.cluster_roadmap,
        metadata: TOPIC.metadata,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();
  if (topicErr) throw topicErr;
  console.log("    topic id:", topic.id);

  console.log("[2/2] audit log");
  await sb.from("health_admin_actions").insert({
    actor_email: ACTOR,
    action: "seed_topic_fitness",
    target_type: "health_topics",
    target_id: topic.id,
    payload: {
      topic_slug: TOPIC.slug,
      cluster_size: TOPIC.cluster_roadmap.length,
      cluster_slugs: TOPIC.cluster_roadmap.map((r) => r.slug),
    },
  });

  console.log("\n✅ done");
  console.log("   topic:", topic.id, TOPIC.slug);
  console.log("   cluster_roadmap entries:", TOPIC.cluster_roadmap.length);
  console.log("\n다음 단계: 첫 글(strength-vs-cardio-fat-loss) PubMed 자료 수집");
}

await run().catch((e) => {
  console.error("\n❌ failed:", e.message ?? e);
  if (e.details) console.error("   details:", e.details);
  if (e.hint) console.error("   hint:", e.hint);
  process.exit(1);
});
