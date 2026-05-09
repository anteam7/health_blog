// 크레아틴 글용 PubMed 자료 4건 일괄 등록.
// 사용법:  node scripts/seed-creatine-sources.mjs

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
const ROADMAP_ORDER = 3;
const PRIMARY_PMID = "39519498";

const PAPERS = [
  {
    pmid: "39519498",
    doi: "10.3390/nu16213665",
    source_type: "paper",
    title:
      "Effects of Creatine Supplementation and Resistance Training on Muscle Strength Gains in Adults <50 Years of Age: A Systematic Review and Meta-Analysis",
    authors: [
      "Wang Z",
      "Qiu B",
      "Li R",
      "Han Y",
      "Petersen C",
      "Liu S",
      "Zhang Y",
      "Liu C",
      "Candow DG",
      "Del Coso J",
    ],
    outlet: "Nutrients",
    published_date: "2024-10-28",
    url: "https://pubmed.ncbi.nlm.nih.gov/39519498/",
    abstract:
      "Meta-analysis of 23 studies (469 participants) examining creatine supplementation + resistance training on strength gains in adults <50 years. Results: Creatine + RT vs placebo significantly increased upper-body strength (WMD 4.43 kg, p<0.001) and lower-body strength (WMD 11.35 kg, p<0.001). Trend toward greater upper-body strength gains in males vs females. Males showed significant gains in both upper and lower body; females did not. Trend toward greater lower-body gains with high-dose creatine. Conclusion: Creatine + RT enhances muscle strength in adults <50, with greater benefits likely in males.",
    key_findings:
      "23개 연구 메타. 50세 미만 성인에서 크레아틴 + 저항운동 조합이 상체 근력을 평균 4.43kg, 하체 근력을 11.35kg 더 늘렸어요. 효과는 남성에서 더 크게 나타났고, 여성 데이터는 부족한 편입니다.",
    topics: ["크레아틴", "근력", "저항운동", "보충제", "성별 차이"],
    quality_score: 4,
    status: "collected",
    notes: "최신 RT + 크레아틴 강도 효과 메타. 성별 subgroup 명시.",
  },
  {
    pmid: "39074168",
    doi: "10.1519/JSC.0000000000004862",
    source_type: "paper",
    title:
      "The Effect of Creatine Supplementation on Resistance Training-Based Changes to Body Composition: A Systematic Review and Meta-analysis",
    authors: [
      "Desai I",
      "Wewege MA",
      "Jones MD",
      "Clifford BK",
      "Pandit A",
      "Kaakoush NO",
      "Simar D",
      "Hagstrom AD",
    ],
    outlet: "Journal of Strength and Conditioning Research",
    published_date: "2024-10-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/39074168/",
    abstract:
      "Meta-analysis of 12 studies on creatine supplementation effects on body composition during resistance training in adults <50 years. Compared to RT alone, creatine increased lean body mass (LBM) by 1.14 kg (95% CI 0.69-1.59), reduced body fat percentage by -0.88% (95% CI -1.66 to -0.11), and reduced body fat mass by -0.73 kg (95% CI -1.34 to -0.11). 7 g/day or 0.3 g/kg of creatine likely increases LBM by 1 kg and reduces fat mass by 0.7 kg more than RT alone. Carbohydrate co-ingestion did not enhance hypertrophy benefits. No differences between training status subgroups.",
    key_findings:
      "12개 연구 메타. 저항운동만 했을 때보다 크레아틴을 함께 쓰면 제지방량(근육·뼈·물 등 지방 뺀 무게)이 평균 1.14kg 늘고, 체지방률이 0.88% 줄었어요. 하루 7g 또는 체중 1kg당 0.3g이면 효과가 분명합니다. 탄수화물과 같이 먹어도 추가 효과는 없었어요.",
    topics: ["크레아틴", "체구성", "제지방량", "체지방", "저항운동"],
    quality_score: 4,
    status: "collected",
    notes: "체구성 변화 핵심 메타. 용량과 탄수화물 병용 효과까지 검증.",
  },
  {
    pmid: "39070254",
    doi: "10.3389/fnut.2024.1424972",
    source_type: "paper",
    title:
      "The effects of creatine supplementation on cognitive function in adults: a systematic review and meta-analysis",
    authors: ["Xu C", "Bi S", "Zhang W", "Luo L"],
    outlet: "Frontiers in Nutrition",
    published_date: "2024-07-12",
    url: "https://pubmed.ncbi.nlm.nih.gov/39070254/",
    abstract:
      "Systematic review and meta-analysis of 16 RCTs (492 participants, age 20.8-76.4 years). Creatine monohydrate showed significant positive effects on memory (SMD = 0.31, 95% CI: 0.18-0.44), attention time (SMD = -0.31), and processing speed (SMD = -0.51). No significant improvements on overall cognitive function or executive function. Subgroup analyses: greater benefits in individuals with diseases, ages 18-60, and females. No significant differences between short-term (<4 weeks) and long-term (≥4 weeks) interventions. GRADE: moderate certainty for memory, low for other domains.",
    key_findings:
      "16개 임상시험 492명 메타. 크레아틴이 기억력에 분명한 긍정 효과(효과크기 0.31), 주의력과 정보 처리 속도에서도 향상을 보였어요. 전체 인지 기능이나 실행 기능에서는 차이가 없었습니다. 효과는 18~60세, 여성, 질환자에서 더 컸어요.",
    topics: ["크레아틴", "인지 기능", "기억력", "주의력", "처리 속도"],
    quality_score: 4,
    status: "collected",
    notes: "운동 외 인지 기능 효과 — 비운동인에게도 의미 있는 데이터.",
  },
  {
    pmid: "28615996",
    doi: "10.1186/s12970-017-0173-z",
    source_type: "paper",
    title:
      "International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine",
    authors: [
      "Kreider RB",
      "Kalman DS",
      "Antonio J",
      "Ziegenfuss TN",
      "Wildman R",
      "Collins R",
      "Candow DG",
      "Kleiner SM",
      "Almada AL",
      "Lopez HL",
    ],
    outlet: "Journal of the International Society of Sports Nutrition",
    published_date: "2017-06-13",
    url: "https://pubmed.ncbi.nlm.nih.gov/28615996/",
    abstract:
      "ISSN position stand on creatine. Creatine is one of the most popular nutritional ergogenic aids. Increases intramuscular creatine concentrations and high-intensity exercise performance, leading to greater training adaptations. Beyond athletic improvement, may enhance post-exercise recovery, injury prevention, thermoregulation, rehabilitation, and concussion/spinal cord neuroprotection. Clinical applications studied: neurodegenerative diseases (muscular dystrophy, Parkinson's, Huntington's), diabetes, osteoarthritis, fibromyalgia, aging, brain and heart ischemia, adolescent depression, pregnancy. Short and long-term supplementation (up to 30 g/day for 5 years) is safe and well-tolerated in healthy individuals and patient populations ranging from infants to the elderly. Habitual low dietary intake (~3 g/day) provides health benefits across the lifespan.",
    key_findings:
      "국제 스포츠영양학회 공식 입장문. 크레아틴은 가장 많이 연구된 운동 보조 보충제로, 일반 권장 용량은 하루 3~5g이에요. 5년 장기 사용까지 안전성이 확인됐고, 운동선수뿐 아니라 일반인·노인·환자군에서도 효과·안전성이 검증됐습니다.",
    topics: ["크레아틴", "가이드라인", "안전성", "용량", "ISSN"],
    quality_score: 5,
    status: "collected",
    notes: "공식 가이드라인. 용량·안전성·임상 적용까지 포괄.",
  },
];

const { data: topic } = await sb
  .from("health_topics")
  .select("id, cluster_roadmap")
  .eq("slug", TOPIC_SLUG)
  .single();
if (!topic) throw new Error(`topic ${TOPIC_SLUG} not found`);

const pmids = PAPERS.map((p) => p.pmid);
const { data: existing } = await sb.from("health_sources").select("pmid").in("pmid", pmids);
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
if (existingPmids.size > 0) {
  await sb.from("health_sources").update({ topic_id: topic.id }).in("pmid", [...existingPmids]);
}

const updatedRoadmap = (topic.cluster_roadmap ?? []).map((r) =>
  r.order === ROADMAP_ORDER ? { ...r, primary_source_pmid: PRIMARY_PMID, status: "planned" } : r
);
await sb.from("health_topics").update({ cluster_roadmap: updatedRoadmap }).eq("id", topic.id);

await sb.from("health_admin_actions").insert({
  actor_email: ACTOR,
  action: "seed_creatine_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ creatine sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
