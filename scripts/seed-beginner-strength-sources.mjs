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
const ROADMAP_ORDER = 2;
const PRIMARY_PMID = "38595233";

const PAPERS = [
  {
    pmid: "38595233",
    doi: "10.1519/JSC.0000000000004774",
    source_type: "paper",
    title:
      "Efficacy of Split Versus Full-Body Resistance Training on Strength and Muscle Growth: A Systematic Review With Meta-Analysis",
    authors: [
      "Ramos-Campo DJ",
      "Benito-Peinado PJ",
      "Andreu-Caravaca L",
      "Rojo-Tirado MA",
      "Rubio-Arias JÁ",
    ],
    outlet: "Journal of Strength and Conditioning Research",
    published_date: "2024-07-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/38595233/",
    abstract:
      "Meta-analysis of 14 studies (392 subjects) comparing split vs full-body resistance training. Similar strength gains in bench press and lower limbs. Comparable muscle growth in elbow extensors, elbow flexors, vastus lateralis, lean body mass. When volume is equated, routine selection does not significantly impact strength or muscle hypertrophy. Individual choice based on preference.",
    key_findings:
      "14개 연구 392명 메타. 분할(split)과 전신(full-body) 운동을 직접 비교했어요. 같은 운동 부하(주당 총 세트)로 통제하면 근력·근비대 결과가 비슷합니다. 즉 초보자가 어느 분할 형태를 고를지는 효과보다 본인 선호로 결정해도 됩니다.",
    topics: ["저항운동", "분할 운동", "전신 운동", "근비대", "초보자"],
    quality_score: 4,
    status: "collected",
    notes: "split vs full-body 직접 비교 메타. 초보자 가이드 핵심.",
  },
  {
    pmid: "37414459",
    doi: "10.1136/bjsports-2023-106807",
    source_type: "paper",
    title:
      "Resistance training prescription for muscle strength and hypertrophy in healthy adults: a systematic review and Bayesian network meta-analysis",
    authors: [
      "Currier BS",
      "Mcleod JC",
      "Banfield L",
      "Beyene J",
      "Welton NJ",
      "D'Souza AC",
      "Keogh JAJ",
      "Lin L",
      "Coletta G",
      "Yang A",
      "Colenso-Semple L",
      "Lau KJ",
      "Verboom A",
      "Phillips SM",
    ],
    outlet: "British Journal of Sports Medicine",
    published_date: "2023-09-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/37414459/",
    abstract:
      "Bayesian network meta-analysis. Strength network: 178 studies (n=5,097, 45% women). Hypertrophy network: 119 studies (n=3,364, 47% women). All resistance training prescriptions superior to control for both. Higher-load prescriptions maximized strength gains. All prescriptions comparably promoted hypertrophy. Highest-ranked: higher-load, multiset, thrice-weekly for strength; higher-load, multiset, twice-weekly for hypertrophy. Threshold analysis: results extremely robust.",
    key_findings:
      "BJSM 베이지안 네트워크 메타. 근력은 고중량·다세트·주 3회가 1위, 근비대는 고중량·다세트·주 2회가 1위였어요. 어떤 처방이든 운동 안 함보다는 우수. 즉 초보자는 어떤 분할이든 시작만 하면 효과를 봅니다.",
    topics: ["저항운동", "처방", "근력", "근비대", "BJSM", "베이지안 네트워크"],
    quality_score: 5,
    status: "collected",
    notes: "BJSM top journal. 처방 종합 가이드 — 초보자 권장 권위 인용.",
  },
  {
    pmid: "30558493",
    doi: "10.1080/02640414.2018.1555906",
    source_type: "paper",
    title:
      "How many times per week should a muscle be trained to maximize muscle hypertrophy? A systematic review and meta-analysis of studies examining the effects of resistance training frequency",
    authors: ["Schoenfeld BJ", "Grgic J", "Krieger J"],
    outlet: "Journal of Sports Sciences",
    published_date: "2019-06-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/30558493/",
    abstract:
      "Meta-analysis of 25 studies on training frequency and hypertrophy. No significant difference between higher and lower frequency on volume-equated basis. No significant differences across categories considering direct measures of growth, in resistance-trained individuals, upper and lower body. Meta-regression of non-volume-equated studies showed significant effect favoring higher frequencies, but modest difference between 1 vs 3+ days per week. Conclusion: training frequency does not significantly impact muscle hypertrophy when volume is equated.",
    key_findings:
      "25개 연구 메타. 같은 주당 총 세트(volume)로 통제하면 주 1회 vs 주 3+회 빈도 차이가 근비대에 큰 영향 없어요. 즉 한 부위를 주 1회로 몰아 하든, 주 2~3회로 나누든 결과가 비슷. 본인 일정에 맞춰 자유롭게.",
    topics: ["저항운동", "frequency", "주당 빈도", "근비대"],
    quality_score: 4,
    status: "collected",
    notes: "Schoenfeld의 frequency 메타. 초보자에게 부담 없는 결론 — 빈도보다 총량.",
  },
  {
    pmid: "41343037",
    doi: "10.1007/s40279-025-02344-w",
    source_type: "paper",
    title:
      "The Resistance Training Dose Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gains",
    authors: ["Pelland JC", "Remmert JF", "Robinson ZP", "Hinson SR", "Zourdos MC"],
    outlet: "Sports Medicine",
    published_date: "2026-02-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/41343037/",
    abstract:
      "Multi-level meta-regressions on volume and frequency. 67 studies, 2,058 participants (79.1% male, 20.9% female; avg age 25.16 ± 5.22 years). Posterior probability of marginal slope exceeding zero for volume effect on hypertrophy and strength: 100%, indicating gains increase with volume. Both models suggest diminishing returns. Frequency effect on hypertrophy: less than 100% (compatible with negligible). Frequency effect on strength: 100% (gains increase with frequency, diminishing returns). Conclusion: distinguishing direct/indirect sets essential. Volume drives hypertrophy and strength with diminishing returns; frequency drives strength but minimally affects hypertrophy.",
    key_findings:
      "67개 연구 2,058명 다층 메타-회귀. 주당 총 세트(volume)가 늘수록 근비대·근력 모두 증가하지만 점차 효과 감소(diminishing returns). 빈도(frequency)는 근력에는 영향 있지만 근비대에는 미미. 즉 초보자에게 가장 중요한 것은 주당 총 세트 수.",
    topics: ["저항운동", "volume", "frequency", "dose-response", "근비대"],
    quality_score: 5,
    status: "collected",
    notes: "최신(2026) Sports Med dose-response 회귀. 핵심 변수가 volume임을 정량화.",
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
  action: "seed_beginner_strength_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ beginner strength sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
