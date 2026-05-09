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
const TOPIC_SLUG = "fitness-foundation";
const ROADMAP_ORDER = 3;
const PRIMARY_PMID = "39003682";

const PAPERS = [
  {
    pmid: "39003682",
    doi: "10.1007/s40279-024-02070-9",
    source_type: "paper",
    title:
      "Efficacy of Interval Training in Improving Body Composition and Adiposity in Apparently Healthy Adults: An Umbrella Review with Meta-Analysis",
    authors: ["Poon ET", "Li HY", "Little JP", "Wong SH", "Ho RS"],
    outlet: "Sports Medicine",
    published_date: "2024-11-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/39003682/",
    abstract:
      "Umbrella review with meta-analysis on interval training body composition. 16 systematic reviews with 79 RCTs and 2,474 participants. Interval training significantly greater reductions in total body fat % vs MICT (WMD -0.77%) and vs control (WMD -1.50%). Significant reductions in fat mass, VAT, subcutaneous abdominal fat. Both HIIT and SIT superior to MICT for BF%. Benefits more prominent in overweight/obesity, longer duration (≥12 weeks), cycling modality, and low-volume HIIT (<15 min high-intensity per session).",
    key_findings:
      "16개 메타·79 RCT·2,474명 umbrella 메타. 인터벌 훈련(HIIT, SIT)이 일반 중강도 유산소(MICT)보다 체지방률을 평균 0.77% 더 줄였어요. 효과는 과체중·비만, 12주 이상 장기 중재, 사이클 운동, 저용량 HIIT(세션당 15분 미만)에서 더 컸습니다.",
    topics: ["HIIT", "MICT", "인터벌", "체지방", "umbrella meta", "Sports Med"],
    quality_score: 5,
    status: "collected",
    notes: "Sports Med top journal. 인터벌 vs 일반 유산소 종합 비교. 첫 글 핵심 인용.",
  },
  {
    pmid: "36981649",
    doi: "10.3390/ijerph20064741",
    source_type: "paper",
    title:
      "Effect of High-Intensity Interval Training vs. Moderate-Intensity Continuous Training on Fat Loss and Cardiorespiratory Fitness in the Young and Middle-Aged a Systematic Review and Meta-Analysis",
    authors: ["Guo Z", "Li M", "Cai J", "Gong W", "Liu Y", "Liu Z"],
    outlet: "International Journal of Environmental Research and Public Health",
    published_date: "2023-03-08",
    url: "https://pubmed.ncbi.nlm.nih.gov/36981649/",
    abstract:
      "Systematic review and meta-analysis on HIIT vs MICT in young/middle-aged adults. 29 studies. Within-group: both HIIT and MICT improve body composition and CRF (except FFM). Between-group: HIIT brought significant benefits to waist circumference, percent fat mass, and VO2peak vs MICT. Conclusion: HIIT effect on fat loss/CRF in young/middle-aged is similar to or better than MICT, more time-saving and enjoyable than MICT.",
    key_findings:
      "29개 RCT 메타. 18~45세 대상 HIIT가 일반 유산소(MICT) 대비 허리둘레·체지방률·심폐 적합도(VO2peak)에서 우수했어요. 임상적 의미는 제한적이지만 시간 효율과 만족도가 더 좋아 일반인 권장에 적합합니다.",
    topics: ["HIIT", "MICT", "체지방", "심폐 적합도", "젊은 성인"],
    quality_score: 4,
    status: "collected",
    notes: "젊은/중년 그룹 직접 비교 메타.",
  },
  {
    pmid: "38760916",
    doi: "10.1111/sms.14652",
    source_type: "paper",
    title:
      "High-intensity interval training and cardiorespiratory fitness in adults: An umbrella review of systematic reviews and meta-analyses",
    authors: ["Poon ET", "Li HY", "Gibala MJ", "Wong SH", "Ho RS"],
    outlet: "Scandinavian Journal of Medicine & Science in Sports",
    published_date: "2024-05-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/38760916/",
    abstract:
      "Umbrella review of 24 systematic reviews (429 primary studies, 12,967 participants) on HIIT and CRF. HIIT significantly increases CRF in adults vs non-exercise control (WMD 3.25-5.5 mL/kg/min) and MICT (WMD 0.52-3.76 mL/kg/min). Effect consistent across healthy adults, overweight/obesity, older adults, athletes. Various HIIT modalities (low-volume, whole-body, home-based, aquatic, short SIT) all effective.",
    key_findings:
      "24개 메타·429 RCT·12,967명 umbrella 메타. HIIT가 심폐 적합도(VO2max)를 일반 유산소(MICT) 대비 평균 0.52~3.76mL/kg/min 더 높였어요. 건강 성인·비만·노인·운동선수 모두에서 일관된 효과. 형태(저용량·전신·가정·수중·짧은 SIT) 무관하게 효과 보임.",
    topics: ["HIIT", "VO2max", "심폐 적합도", "umbrella meta"],
    quality_score: 5,
    status: "collected",
    notes: "심폐 적합도 측면 가장 종합적인 umbrella. HIIT의 분명한 우위 영역.",
  },
  {
    pmid: "38718488",
    doi: "10.1016/j.archger.2024.105451",
    source_type: "paper",
    title:
      "Effects of high-intensity interval and continuous moderate aerobic training on fitness and health markers of older adults: A systematic review and meta-analysis",
    authors: ["Oliveira A", "Fidalgo A", "Farinatti P", "Monteiro W"],
    outlet: "Archives of Gerontology and Geriatrics",
    published_date: "2024-09-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/38718488/",
    abstract:
      "Meta-analysis of HIIT vs MICT in older adults (≥60 y). 29 trials, 1,227 subjects. HIIT and MICT elicited significant and similar gains for VO2max, peak power, % fat, glycemia, blood pressure. HIIT but not MICT produced significant gains for fat mass, waist circumference, testosterone, and Stroop test (cognitive). Controlled trials showed cardiorespiratory gains higher in HIIT vs MICT (g 1.068 vs 0.109).",
    key_findings:
      "60세 이상 1,227명 메타. HIIT와 MICT는 대부분 outcome에서 비슷한 효과. 단 HIIT는 추가로 지방량·허리둘레·테스토스테론·인지 기능(Stroop test)도 개선했어요. 통제된 RCT만 봤을 때 심폐 적합도는 HIIT가 분명히 우수.",
    topics: ["HIIT", "MICT", "노인", "심폐 적합도", "인지"],
    quality_score: 4,
    status: "collected",
    notes: "노인 시나리오 메타. 노인에게도 HIIT가 안전하게 효과 — 단 강도 조정 필요.",
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
  action: "seed_hiit_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ HIIT sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
