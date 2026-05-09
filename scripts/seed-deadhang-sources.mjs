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
const ROADMAP_ORDER = 6;
const PRIMARY_PMID = "28549705";

const PAPERS = [
  {
    pmid: "28549705",
    doi: "10.1016/j.jamda.2017.03.011",
    source_type: "paper",
    title:
      "Association of Grip Strength With Risk of All-Cause Mortality, Cardiovascular Diseases, and Cancer in Community-Dwelling Populations: A Meta-analysis of Prospective Cohort Studies",
    authors: ["Wu Y", "Wang W", "Liu T", "Zhang D"],
    outlet: "Journal of the American Medical Directors Association",
    published_date: "2017-06-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/28549705/",
    abstract:
      "Meta-analysis of 42 prospective cohort studies, 3,002,203 participants. For lowest vs highest grip strength category: HR 1.41 (1.30-1.52) for all-cause mortality, 1.63 (1.36-1.96) for CVD, 0.89 for cancer. Per 5-kg decrease in grip strength: HR 1.16 for all-cause mortality, 1.21 for CVD, 1.09 for stroke, 1.07 for CHD, 1.01 for cancer. Associations did not differ by sex, remained after excluding baseline CVD/cancer. Linear relationships between grip strength and mortality/CVD risk within 56 kg. Conclusion: Grip strength is independent predictor of all-cause mortality and CVD in community-dwelling populations.",
    key_findings:
      "300만 명 코호트 메타. 악력이 5kg 감소할 때마다 전체 사망률이 16%, 심혈관 사망률이 21% 증가했어요. 즉 악력은 단순 근육 측정값이 아니라 전반적 건강의 강력한 예측 지표입니다.",
    topics: ["악력", "사망률", "심혈관", "예측 인자", "코호트 메타"],
    quality_score: 4,
    status: "collected",
    notes: "악력의 mortality 예측력 핵심 메타 — 데드행 가치 추론의 간접 근거.",
  },
  {
    pmid: "36332759",
    doi: "10.1016/j.arr.2022.101778",
    source_type: "paper",
    title:
      "Thresholds of handgrip strength for all-cause, cancer, and cardiovascular mortality: A systematic review with dose-response meta-analysis",
    authors: [
      "López-Bueno R",
      "Andersen LL",
      "Koyanagi A",
      "Núñez-Cortés R",
      "Calatayud J",
      "Casaña J",
      "Del Pozo Cruz B",
    ],
    outlet: "Ageing Research Reviews",
    published_date: "2022-12-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/36332759/",
    abstract:
      "Systematic review with dose-response meta-analysis on handgrip strength thresholds. 48 prospective cohort studies, 3,135,473 participants. Inverse associations between handgrip strength and mortality. All-cause mortality showed close-to-linear risk reduction at 26-50 kg. Cancer mortality showed U-shaped pattern with significant protection between 16-33 kg. CVD mortality linear inverse within 24-40 kg range. Conclusion: lower handgrip strength associates with higher mortality across all causes, with dose-response varying by mortality type.",
    key_findings:
      "313만 명 메타로 악력 사망률 임계 분석. 전체 사망률 감소는 26~50kg 범위에서 거의 선형, 심혈관 사망률은 24~40kg 범위에서 유사. 악력이 강할수록 안전 영역에 들어간다는 dose-response 관계 확인.",
    topics: ["악력", "임계값", "사망률", "dose-response", "심혈관"],
    quality_score: 4,
    status: "collected",
    notes: "악력 mortality dose-response — 어느 수준 이상이면 위험 감소.",
  },
  {
    pmid: "28630217",
    doi: "10.1136/bjsports-2016-096515",
    source_type: "paper",
    title:
      "Effectiveness of conservative interventions including exercise, manual therapy and medical management in adults with shoulder impingement: a systematic review and meta-analysis of RCTs",
    authors: [
      "Steuri R",
      "Sattelmayer M",
      "Elsig S",
      "Kolly C",
      "Tal A",
      "Taeymans J",
      "Hilfiker R",
    ],
    outlet: "British Journal of Sports Medicine",
    published_date: "2017-09-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/28630217/",
    abstract:
      "Systematic review and meta-analysis of RCTs on conservative interventions for adult shoulder impingement. Outcomes: pain, function, ROM. Exercise exceeded non-exercise controls for pain reduction. Specific exercises outperformed generic exercises. Corticosteroid injections, ultrasound-guided injections, NSAIDs, manual therapy, laser, ECSWT, and tape all showed superiority over comparators. Manual therapy combined with exercise showed benefits vs exercise alone at shortest follow-up. Conclusion: Although evidence quality very low, exercise should be considered for shoulder impingement, with potential addition of tape, ECSWT, laser or manual therapy.",
    key_findings:
      "어깨 충돌증후군에 대한 보존적 치료 메타. 운동은 비운동 대조군 대비 통증 감소에 분명한 효과를 보였고, **타깃이 명확한 운동이 일반 운동보다 더 효과적**이었어요. 즉 어깨 통증 관리에는 어깨 가동성·강화 운동이 표준입니다.",
    topics: ["어깨 충돌", "운동 치료", "보존적 치료", "어깨 통증", "메타분석"],
    quality_score: 4,
    status: "collected",
    notes: "어깨 운동 효과 메타 — 데드행을 어깨 가동성 운동으로 자리매김할 근거.",
  },
  {
    pmid: "26016893",
    doi: "10.1111/ggi.12508",
    source_type: "paper",
    title:
      "Prognostic value of handgrip strength in people aged 60 years and older: A systematic review and meta-analysis",
    authors: [
      "Rijk JM",
      "Roos PRKM",
      "Deckx L",
      "van den Akker M",
      "Buntinx F",
    ],
    outlet: "Geriatrics & Gerontology International",
    published_date: "2016-01-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/26016893/",
    abstract:
      "Systematic review and meta-analysis on handgrip strength as marker for vulnerability in adults 60+. 34 articles included, examining association with cognition (9), functional status (12), mobility (6), mortality (22). Higher baseline handgrip strength protective against declines. Pooled hazard ratio for mortality: 1.79 (95% CI 1.26-2.55) for categorical (high vs low) and 0.96 (0.93-0.98) per kg. Functional status pooled ratio: 1.78 (1.28-2.48) categorical and 0.95 (0.92-0.99) continuous. Conclusion: Handgrip strength has predictive validity for decline in cognition, mobility, functional status and mortality in older community-dwelling populations.",
    key_findings:
      "60세 이상 메타. 악력은 사망률뿐 아니라 인지·기동성·일상 기능 저하까지 예측해요. 약한 그룹 vs 강한 그룹의 사망 위험 비율 1.79배. 즉 노인의 종합 건강 지표로 악력이 가장 단순하면서 강력한 도구입니다.",
    topics: ["악력", "노인", "인지", "기동성", "사망률"],
    quality_score: 4,
    status: "collected",
    notes: "노인 악력의 종합 예측력 — 데드행이 일상에 들어갈 가치를 뒷받침.",
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
  action: "seed_deadhang_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ dead hang sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
