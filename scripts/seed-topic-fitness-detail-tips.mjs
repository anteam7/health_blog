// "운동·헬스 디테일 가이드" 토픽 + cluster_roadmap 6편 candidate 시드.
// 마이너 specific 질문 묶음 — fitness-foundation(메인 7편)과 다른 mini cluster.
// 사용법:  node scripts/seed-topic-fitness-detail-tips.mjs

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

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const ACTOR = "anseunghyok@gmail.com";

const TOPIC = {
  slug: "fitness-detail-tips",
  title: "운동·헬스 디테일 가이드",
  description:
    "카페인·스트레칭 타이밍·크레아틴·폼롤러·운동 시간대·데드행처럼 운동 효과를 좌우하는 specific 질문에 대한 근거 정리. 메인 가이드(fitness-foundation)와 별개의 mini cluster.",
  keywords: [
    "운동 디테일",
    "운동 팁",
    "카페인 운동",
    "스트레칭 타이밍",
    "크레아틴",
    "폼롤러",
    "운동 시간대",
    "데드행",
    "매달리기",
    "근막 이완",
    "운동 보충제",
    "ergogenic",
    "warm-up",
    "creatine",
    "foam rolling",
  ],
  status: "in_progress",
  priority: 4,
  cluster_roadmap: [
    {
      order: 1,
      slug: "caffeine-exercise-performance",
      title: "카페인이 운동 퍼포먼스에 미치는 영향 — 커피 한 잔의 진짜 효과",
      target_keyword: "운동 전 카페인",
      primary_source_pmid: null,
      status: "candidate",
      notes:
        "입구글 — 검색량 큰 ergogenic aid 메타분석 다수. AdSense 컴플라이언스 OK (커피는 일반 식품).",
    },
    {
      order: 2,
      slug: "stretching-before-vs-after-workout",
      title: "운동 전 스트레칭 vs 운동 후 스트레칭 — 어느 쪽이 더 중요할까",
      target_keyword: "운동 전 스트레칭",
      primary_source_pmid: null,
      status: "candidate",
      notes:
        "한국 검색량 매우 높음. static vs dynamic stretching 메타분석 풍부.",
    },
    {
      order: 3,
      slug: "creatine-general-population",
      title: "크레아틴 보충제 — 일반인에게도 효과 있을까",
      target_keyword: "크레아틴 효과",
      primary_source_pmid: null,
      status: "candidate",
      notes:
        "운동 선수 외 일반인 효과 — 메타분석 다수. 효능 단정 X — '연관성이 보고됨' 형태.",
    },
    {
      order: 4,
      slug: "foam-rolling-recovery-effect",
      title: "폼롤러·근막이완 — 회복·DOMS에 정말 도움될까",
      target_keyword: "폼롤러 효과",
      primary_source_pmid: null,
      status: "candidate",
      notes:
        "self-myofascial release 메타분석 — 수면·DOMS 회복 outcomes. 한국 헬스인 매우 익숙한 도구.",
    },
    {
      order: 5,
      slug: "exercise-time-morning-vs-evening",
      title: "운동 시간대 — 아침 vs 저녁, 체지방 감량·근비대에 차이가 있을까",
      target_keyword: "운동 시간대",
      primary_source_pmid: null,
      status: "candidate",
      notes:
        "circadian rhythm + exercise outcome RCT/메타. 일반인 가장 자주 묻는 질문.",
    },
    {
      order: 6,
      slug: "dead-hang-shoulder-grip-strength",
      title: "데드행(매달리기) — 어깨·등·악력에 어떤 효과가 있을까",
      target_keyword: "데드행 효과",
      primary_source_pmid: null,
      status: "candidate",
      notes:
        "비교적 마이너하지만 SNS·헬스 커뮤니티 인지도 높음. dead hang shoulder impingement / grip strength 연구.",
    },
  ],
  metadata: {
    cluster_size: 6,
    target_search_volume: "medium-high",
    competition: "low-medium",
    category: "fitness",
    notes:
      "fitness-foundation 메인 7편과 별도의 mini cluster. specific 질문 묶음. 사용자 명시(2026-05-09): '운동 헬스와 관련된 마이너한 주제 6개'.",
  },
};

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

await sb.from("health_admin_actions").insert({
  actor_email: ACTOR,
  action: "seed_topic_fitness_detail_tips",
  target_type: "health_topics",
  target_id: topic.id,
  payload: {
    topic_slug: TOPIC.slug,
    cluster_size: TOPIC.cluster_roadmap.length,
    cluster_slugs: TOPIC.cluster_roadmap.map((r) => r.slug),
  },
});

console.log("✅ topic seeded");
console.log("   id:", topic.id);
console.log("   slug:", TOPIC.slug);
console.log("   cluster:", TOPIC.cluster_roadmap.length, "edits candidate");
console.log("\n다음 단계: 첫 글(caffeine-exercise-performance) PubMed 자료 수집");
