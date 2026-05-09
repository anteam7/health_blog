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
const ROADMAP_ORDER = 6;
const PRIMARY_PMID = "39691170";

const PAPERS = [
  {
    pmid: "39691170",
    doi: "10.3389/fnut.2024.1491931",
    source_type: "paper",
    title:
      "Reliability, biological variability, and accuracy of multi-frequency bioelectrical impedance analysis for measuring body composition components",
    authors: [
      "Looney DP",
      "Schafer EA",
      "Chapman CL",
      "Pryor RR",
      "Potter AW",
      "Roberts BM",
      "Friedl KE",
    ],
    outlet: "Frontiers in Nutrition",
    published_date: "2024-12-03",
    url: "https://pubmed.ncbi.nlm.nih.gov/39691170/",
    abstract:
      "Evaluation of multi-frequency BIA (InBody 770) reliability, variability, accuracy. 14 healthy adults, MF-BIA in duplicate on 5 visits over 3 weeks. Test-retest reliability very high for whole-body water and mass (ICC ≥ 0.999), high for regional (ICC 0.973-1.000). Compared to DXA, MF-BIA whole-body %BF showed offset (Bias -4.0 ± 2.8%). Conclusion: under controlled conditions, MF-BIA system has high methodological reliability and demonstrates stable day-to-day measurements.",
    key_findings:
      "InBody 770 (multi-frequency BIA, 한국 체성분 측정기 표준) 신뢰도·정확도 평가. 같은 사람을 반복 측정했을 때는 매우 안정적(ICC ≥ 0.999)이었지만, DXA와 비교하면 체지방률을 평균 4% 낮게 측정했어요. 즉 절대값보다는 같은 기기로 반복 측정한 변화 추세가 더 신뢰할 만합니다.",
    topics: ["BIA", "InBody", "체성분", "DXA", "신뢰도"],
    quality_score: 4,
    status: "collected",
    notes: "InBody의 한국 헬스인 인지도 + DXA 대비 4% 체지방률 오차 정량화.",
  },
  {
    pmid: "30297760",
    doi: "10.1038/s41430-018-0335-3",
    source_type: "paper",
    title:
      "Bioelectrical impedance analysis for body composition assessment: reflections on accuracy, clinical utility, and standardisation",
    authors: ["Ward LC"],
    outlet: "European Journal of Clinical Nutrition",
    published_date: "2019-02-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/30297760/",
    abstract:
      "Perspective review on BIA accuracy, clinical utility, and standardisation. BIA's accuracy is questioned, but the magnitude of errors is not dissimilar to so-called gold standard methods. Statistically significant but small differences between methods can obscure operational equivalence. Need for better protocol standardization and consensus on minimal clinically important differences highlighted.",
    key_findings:
      "BIA의 임상 유용성 종합 review. BIA 오차가 비판받지만, 사실 'gold standard' 방법(DXA 등)과 비교해도 오차 크기는 비슷한 수준이에요. 통계적으로 분명한 작은 차이가 임상적으로 큰 의미가 없을 수 있다는 관점. 측정 프로토콜 표준화가 더 큰 개선 여지.",
    topics: ["BIA", "정확도", "임상 유용성", "표준화"],
    quality_score: 3,
    status: "collected",
    notes: "BIA 비판에 대한 균형 잡힌 시각 제공. 일반 헬스인용 메시지에 도움.",
  },
  {
    pmid: "24914773",
    doi: "10.1080/02640414.2014.926380",
    source_type: "paper",
    title:
      "The accuracy and precision of DXA for assessing body composition in team sport athletes",
    authors: [
      "Bilsborough JC",
      "Greenway K",
      "Opar D",
      "Livingstone S",
      "Cordy J",
      "Coutts AJ",
    ],
    outlet: "Journal of Sports Sciences",
    published_date: "2014-06-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/24914773/",
    abstract:
      "Validation of pencil and fan beam DXA in 36 professional Australian Football players. Whole body phantom validation. Fat-free soft tissue mass (FFSTM) and bone mineral content (BMC) showed strong correlations with criterion phantom. Fat mass moderate correlations (r=0.64-0.67) with moderate differences. DXA precision: BMC CV 0.6-1.5%, FFSTM CV 0.3-0.5%, fat mass CV 2.5-5.9%. Conclusion: DXA provides precise measures of FFSTM and BMC; suitable for assessing body composition in lean team sport athletes.",
    key_findings:
      "프로 운동선수 36명 DXA 정확도 평가. DXA가 제지방 조직(근육·뼈)에서는 매우 정확(오차 0.3~1.5%), 체지방에서는 중간 정확도(오차 2.5~5.9%). 같은 사람을 반복 측정한 정밀도는 매우 높음. 즉 DXA가 reference standard로 쓰이지만 체지방 절대값엔 한계가 있어요.",
    topics: ["DXA", "정확도", "정밀도", "체성분", "운동선수"],
    quality_score: 4,
    status: "collected",
    notes: "DXA의 제지방·체지방 정확도 차이 정량화.",
  },
  {
    pmid: "20307312",
    doi: "10.1186/1743-7075-7-22",
    source_type: "paper",
    title:
      "Accuracy of DXA in estimating body composition changes in elite athletes using a four compartment model as the reference method",
    authors: [
      "Santos DA",
      "Silva AM",
      "Matias CN",
      "Fields DA",
      "Heymsfield SB",
      "Sardinha LB",
    ],
    outlet: "Nutrition & Metabolism",
    published_date: "2010-03-22",
    url: "https://pubmed.ncbi.nlm.nih.gov/20307312/",
    abstract:
      "27 elite male judo athletes assessed for body composition changes from weight-stable to pre-competition period. DXA compared to 4-compartment model (criterion). Group-level: DXA changes not significantly different from 4C. However, DXA explained only 29-38% of 4C reference variation. Individual 95% limits of agreement: %FM -3.7 to 5.3, FM -2.6 to 3.7 kg, FFM -3.7 to 2.7 kg. DXA overestimated at lower ends and underestimated at upper ends of FM changes. Conclusion: DXA did not present expected accuracy in tracking adiposity changes in elite male judo athletes at group or individual level.",
    key_findings:
      "엘리트 유도 선수 27명 DXA vs 4-compartment 모델 비교. 그룹 평균은 비슷했지만 개인 단위로는 체지방 변화의 29~38%만 설명. 95% 신뢰구간 폭이 약 3~5%로 넓어 개인 단위 변화 추적엔 한계가 있다는 결론. 반복 측정의 정밀도와 변화 정확도는 다른 문제예요.",
    topics: ["DXA", "체성분 변화", "정확도", "엘리트 운동선수"],
    quality_score: 4,
    status: "collected",
    notes: "DXA로도 개인 단위 체지방 변화 추적엔 한계 — 일반인 메시지에 중요.",
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
  action: "seed_bodycomp_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ body composition sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
