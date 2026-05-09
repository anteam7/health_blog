// 카페인×운동 첫 글용 PubMed 자료 4건 일괄 등록.
// 모든 메타데이터는 PubMed 페이지에서 fetch 검증 (2026-05-09).
//
// 사용법:  node scripts/seed-caffeine-sources.mjs

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
const TOPIC_SLUG = "fitness-detail-tips";

const PAPERS = [
  {
    pmid: "39170391",
    doi: "10.1016/j.heliyon.2024.e35025",
    source_type: "paper",
    title:
      "The effect of caffeine supplementation on muscular strength and endurance: A meta-analysis of meta-analyses",
    authors: [
      "Bilondi HT",
      "Valipour H",
      "Khoshro S",
      "Jamilian P",
      "Ostadrahimi A",
      "Zarezadeh M",
    ],
    outlet: "Heliyon",
    published_date: "2024-07-25",
    url: "https://pubmed.ncbi.nlm.nih.gov/39170391/",
    abstract:
      "Background: Caffeine is commonly used as an ergogenic aid to increase strength and endurance in athletes. The results of meta-analyses in this regard are still conflicting. Therefore, the current umbrella meta-analysis was conducted to determine the effects of caffeine supplementation on muscle strength and endurance as a clear and final conclusion. Methods: Relevant studies searched in PubMed, Scopus, and Web of Science until August 15, 2022. Random effects model was used. Findings: 9 meta-analyses were included. Caffeine supplementation led to a significant increase in muscle strength (SMD = 0.18, 95% CI: 0.14, 0.21; p < 0.001) and muscle endurance (SMD = 0.30, 95% CI: 0.21, 0.38; p < 0.001). Conclusion: Significant effects of caffeine on muscle strength and endurance. Further studies needed in women's population.",
    key_findings:
      "9개 메타분석을 한 번에 묶어 본 umbrella 메타. 카페인 보충이 근력(효과크기 0.18)과 근지구력(0.30) 모두에서 통계적으로 분명한 효과를 보였어요. 단 여성 대상 데이터는 부족하다는 한계도 함께 적었습니다.",
    topics: ["카페인", "근력", "근지구력", "ergogenic", "umbrella meta"],
    quality_score: 4,
    status: "collected",
    notes: "첫 글 핵심 인용 — 9개 메타를 통합한 가장 권위 있는 결론.",
  },
  {
    pmid: "41127092",
    doi: "10.3389/fnut.2025.1686283",
    source_type: "paper",
    title:
      "Effects of acute caffeine intake on muscular power during resistance exercise: a systematic review and meta-analysis",
    authors: [
      "Xiao Y",
      "Ding L",
      "Xu Z",
      "Liu J",
      "Guo L",
      "Barnes MJ",
      "Cao Y",
      "Girard O",
    ],
    outlet: "Frontiers in Nutrition",
    published_date: "2025-10-07",
    url: "https://pubmed.ncbi.nlm.nih.gov/41127092/",
    abstract:
      "Background: This study examined the effects of caffeine on movement velocity and power output during resistance exercises and explored moderating factors. Methods: Systematic search of five databases through June 2025. Random-effects model. Subgroup analyses by sex, dose, habitual consumption, muscle group, load. Results: 12 studies, 230 participants. Caffeine significantly improved mean velocity (SMD = 0.42, 95% CI: 0.19-0.65, p < 0.05) and mean power output (SMD = 0.21, 95% CI: 0.12-0.30, p < 0.05). Greater improvements in mean velocity in males (SMD: 0.56 vs. 0.22) and habitual caffeine consumption < 3 mg/kg/day (SMD: 0.87 vs. 0.21). Conclusion: Caffeine ingestion enhances movement velocity and power output during resistance exercises, regardless of load. More pronounced in males, higher doses, low habitual consumers, lower-body exercises.",
    key_findings:
      "12개 연구·230명 대상 메타. 저항운동 중 카페인이 동작 속도(효과크기 0.42)와 파워(0.21) 모두 분명히 높였어요. 효과가 더 큰 그룹은 남성, 평소 카페인 적게 마시는 사람(3mg/kg/일 미만), 그리고 하체 운동이었습니다.",
    topics: ["카페인", "저항운동", "파워", "근력", "용량 반응"],
    quality_score: 4,
    status: "collected",
    notes: "최신(2025) 저항운동 특화 메타. 성별·습관·부위별 subgroup 분석 풍부.",
  },
  {
    pmid: "38836626",
    doi: "10.1080/15502783.2024.2363789",
    source_type: "paper",
    title:
      "Effect of caffeine ingestion on time trial performance in cyclists: a systematic review and meta-analysis",
    authors: ["Chen B", "Ding L", "Qin Q", "Lei TH", "Girard O", "Cao Y"],
    outlet: "Journal of the International Society of Sports Nutrition",
    published_date: "2024-06-05",
    url: "https://pubmed.ncbi.nlm.nih.gov/38836626/",
    abstract:
      "Background: Caffeine, widely recognized as an ergogenic aid, demonstrated to enhance endurance performance. Gap in systematically evaluating effects on time trial (TT) performance in cyclists. Methods: Search of four databases through 1 December 2023. Crossover, placebo-controlled studies. Time and mean power output (MPO) measures. Random-effects model. Results: 15 studies. Subgroup analysis: moderate doses (4-6 mg/kg) significantly improved cycling performance (SMD Time = -0.55, 95% CI = -0.84 to -0.26, p < 0.01; SMD MPO = 0.44, 95% CI = 0.09 to 0.79, p < 0.05). Low doses (1-3 mg/kg) not significant. Conclusion: Moderate dosage (4-6 mg/kg) of caffeine, identified as the optimal dose range, significantly improves time trial performance of cyclists. Low dose (1-3 mg/kg) does not yield improvement.",
    key_findings:
      "15개 연구 메타. 사이클 타임트라이얼에서 중간 용량(체중 1kg당 4~6mg) 카페인이 완주 시간을 줄이고 평균 파워를 높였어요. 반면 낮은 용량(1~3mg/kg)은 효과가 통계적으로 분명하지 않았습니다. 즉 효과는 용량 의존적입니다.",
    topics: ["카페인", "지구력", "사이클", "용량", "타임트라이얼"],
    quality_score: 4,
    status: "collected",
    notes: "지구력 종목 대표 메타. 용량 반응 곡선이 명확.",
  },
  {
    pmid: "33388079",
    doi: "10.1186/s12970-020-00383-4",
    source_type: "paper",
    title:
      "International society of sports nutrition position stand: caffeine and exercise performance",
    authors: [
      "Guest NS",
      "VanDusseldorp TA",
      "Nelson MT",
      "Grgic J",
      "Schoenfeld BJ",
      "Jenkins NDM",
      "Arent SM",
      "Antonio J",
      "Stout JR",
      "Trexler ET",
      "Smith-Ryan AE",
      "Goldstein ER",
      "Kalman DS",
      "Campbell BI",
    ],
    outlet: "Journal of the International Society of Sports Nutrition",
    published_date: "2021-01-02",
    url: "https://pubmed.ncbi.nlm.nih.gov/33388079/",
    abstract:
      "ISSN position regarding caffeine intake: 1. Supplementation acutely enhances exercise performance in many but not all studies. Small to moderate benefits include muscular endurance, movement velocity and strength, sprinting, jumping, throwing, aerobic and anaerobic actions. 2. Aerobic endurance shows most consistent moderate-to-large benefits. 3. 3-6 mg/kg body mass effective, minimal effective dose may be 2 mg/kg. Very high doses (9 mg/kg) high side-effect incidence with no extra benefit. 4. Most common timing 60 min pre-exercise. 5. Improves performance in both trained and untrained. 6. Inter-individual differences attributed to genetic variation in caffeine metabolism. 7. Improves cognitive function (attention, vigilance). 8. May improve under sleep deprivation. 9. Useful in heat (3-6 mg/kg) and altitude (4-6 mg/kg). 10. Alternative sources (chewing gum, mouth rinses) shown to improve aerobic performance. 11. Energy drinks and pre-workout supplements enhance anaerobic and aerobic performance.",
    key_findings:
      "국제 스포츠영양학회의 공식 입장문. 권장 용량은 체중 1kg당 3~6mg, 운동 시작 60분 전 섭취가 표준이에요. 9mg/kg 같은 고용량은 부작용만 늘고 추가 효과는 없습니다. 훈련된 사람과 비훈련자 모두에게 효과가 있고, 카페인 대사 유전자에 따라 개인차가 큽니다.",
    topics: ["카페인", "가이드라인", "용량", "ergogenic", "ISSN"],
    quality_score: 5,
    status: "collected",
    notes: "공식 가이드라인 — 용량·타이밍·개인차 권장의 기준.",
  },
];

// 토픽 id 조회
const { data: topic } = await sb
  .from("health_topics")
  .select("id, cluster_roadmap")
  .eq("slug", TOPIC_SLUG)
  .single();
if (!topic) throw new Error(`topic ${TOPIC_SLUG} not found`);

// 중복 PMID 체크
const pmids = PAPERS.map((p) => p.pmid);
const { data: existing } = await sb
  .from("health_sources")
  .select("pmid")
  .in("pmid", pmids);
const existingPmids = new Set((existing ?? []).map((r) => r.pmid));
const toInsert = PAPERS.filter((p) => !existingPmids.has(p.pmid));
console.log(`PMIDs: ${pmids.length} total, skip ${existingPmids.size}, insert ${toInsert.length}`);

if (toInsert.length > 0) {
  const rows = toInsert.map((p) => ({ ...p, topic_id: topic.id, collected_by: ACTOR }));
  const { data: inserted, error } = await sb
    .from("health_sources")
    .insert(rows)
    .select("id, pmid, title");
  if (error) throw error;
  for (const r of inserted ?? []) console.log(`  + ${r.pmid}  ${r.title.slice(0, 70)}…`);
}

// 기존 row 도 topic_id 갱신
if (existingPmids.size > 0) {
  await sb.from("health_sources").update({ topic_id: topic.id }).in("pmid", [...existingPmids]);
}

// roadmap order=1 primary 갱신
const updatedRoadmap = (topic.cluster_roadmap ?? []).map((r) =>
  r.order === 1 ? { ...r, primary_source_pmid: "39170391", status: "planned" } : r
);
await sb.from("health_topics").update({ cluster_roadmap: updatedRoadmap }).eq("id", topic.id);

await sb.from("health_admin_actions").insert({
  actor_email: ACTOR,
  action: "seed_caffeine_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log("\n✅ caffeine sources seeded");
console.log("   roadmap #1 primary_source_pmid: 39170391 (status: planned)");
