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
const ROADMAP_ORDER = 4;
const PRIMARY_PMID = "28698222";

const PAPERS = [
  {
    pmid: "28698222",
    doi: "10.1136/bjsports-2017-097608",
    source_type: "paper",
    title:
      "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults",
    authors: [
      "Morton RW",
      "Murphy KT",
      "McKellar SR",
      "Schoenfeld BJ",
      "Henselmans M",
      "Helms E",
      "Aragon AA",
      "Devries MC",
      "Banfield L",
      "Krieger JW",
      "Phillips SM",
    ],
    outlet: "British Journal of Sports Medicine",
    published_date: "2018-03-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
    abstract:
      "Systematic review, meta-analysis and meta-regression of 49 RCTs (1863 participants) examining protein supplementation effects on resistance training (RET) outcomes. Results: significant increases in 1RM strength (2.49 kg), fat-free mass (0.30 kg), and muscle fiber CSA (310 µm²). Effect of protein supplementation reduced with age and increased with training experience. Two-phase break point analysis revealed protein intakes >1.62 g/kg/day produced no further RET-induced gains in fat-free mass. Conclusion: protein supplementation enhances strength and size during prolonged RET in healthy adults; ~1.6 g/kg/day appears to be upper threshold.",
    key_findings:
      "49개 RCT 1,863명 메타. 단백질 보충이 저항운동의 근력(평균 +2.49kg 1RM)과 제지방량(평균 +0.3kg) 증가를 도왔어요. 핵심은 체중 1kg당 하루 1.6g이 임계 — 이를 초과해도 추가 효과가 없었습니다. 효과는 나이가 들수록 줄고, 운동 경험이 많을수록 큽니다.",
    topics: ["단백질", "보충제", "저항운동", "근력", "근비대", "메타분석"],
    quality_score: 5,
    status: "collected",
    notes: "BJSM 권위 메타. 1.6g/kg 임계 + 나이·경험 효과 정량화. 첫 글 핵심 인용.",
  },
  {
    pmid: "41635649",
    doi: "10.1155/tsm2/5557511",
    source_type: "paper",
    title:
      "Which Protein-Based Dietary Supplements Most Effectively Enhance Fat-Free Mass and Strength Gains in Healthy Adults Undergoing Resistance Training? A Network Meta-Analysis",
    authors: [
      "Drummond MDM",
      "Silva RAD",
      "Carvas Junior N",
      "Melo MS",
      "Ferreira MHL",
    ],
    outlet: "Translational Sports Medicine",
    published_date: "2026-02-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/41635649/",
    abstract:
      "Network meta-analysis of 78 RCTs, 4,755 participants, 13 protein supplement types vs placebo and control. Results: For strength, collagen most effective (SMD 0.41, SUCRA 88.05%), followed by whey (SMD 0.15, SUCRA 64.34%). Other supplements no statistically significant difference vs placebo. For fat-free mass, similar pattern: collagen superior (SMD 0.94, SUCRA 98.92%), then whey (SMD 0.16, SUCRA 60.23%). Conclusion: collagen and whey are the only protein supplements significantly effective for strength training adaptations; collagen shows superior effect for both outcomes.",
    key_findings:
      "78개 RCT 4,755명 네트워크 메타. 13가지 단백질 보충제 중 콜라겐과 유청 단백질만 위약 대비 통계적으로 유의한 효과를 냈어요. 다른 종류(카제인·대두·완두 등)는 위약과 차이 없음. 콜라겐이 SUCRA 순위 1위로 보고됐는데, 이는 최근 연구라 추가 검증 필요.",
    topics: ["단백질", "콜라겐", "유청", "보충제 종류 비교", "네트워크 메타"],
    quality_score: 4,
    status: "collected",
    notes: "최신(2026) 네트워크 메타. 종류별 비교 — 콜라겐 의외 결과는 한계 명시 필요.",
  },
  {
    pmid: "36057893",
    doi: "10.1186/s40798-022-00508-w",
    source_type: "paper",
    title:
      "Synergistic Effect of Increased Total Protein Intake and Strength Training on Muscle Strength: A Dose-Response Meta-analysis of Randomized Controlled Trials",
    authors: [
      "Tagawa R",
      "Watanabe D",
      "Ito K",
      "Otsuyama T",
      "Nakayama K",
      "Sanbongi C",
      "Miyachi M",
    ],
    outlet: "Sports Medicine Open",
    published_date: "2022-09-04",
    url: "https://pubmed.ncbi.nlm.nih.gov/36057893/",
    abstract:
      "Dose-response meta-analysis of 82 RCTs (69 used for spline curves) on protein intake and muscle strength. Results: muscle strength increase only with resistance training (MD 2.01%), not without (MD 0.13%). Spline model showed 0.72% strength increase per 0.1 g/kg/day increase in total protein up to 1.5 g/kg/day; no further gains beyond. Conclusion: concurrent resistance training essential for protein to improve strength; 1.5 g/kg/day appears optimal upper bound.",
    key_findings:
      "82개 RCT 메타. 단백질 섭취량 증가가 근력 향상으로 이어지는 건 저항운동을 같이 할 때만 보였어요. 운동 없이 단백질만 늘리면 근력 변화 없음(0.13%). 1.5g/kg/일이 효과 임계값 — 그 이상은 추가 효과 없음. Morton 2018(1.6g)과 비슷한 결론.",
    topics: ["단백질", "용량", "저항운동", "근력", "dose-response"],
    quality_score: 4,
    status: "collected",
    notes: "용량-반응 곡선 핵심 메타. 운동 동반 필수성 + 1.5g/kg 임계.",
  },
  {
    pmid: "38374703",
    doi: "10.4178/epih.e2024030",
    source_type: "paper",
    title:
      "The effectiveness of protein supplementation combined with resistance exercise programs among community-dwelling older adults with sarcopenia: a systematic review and meta-analysis",
    authors: ["Whaikid P", "Piaseu N"],
    outlet: "Epidemiology and Health",
    published_date: "2024-02-14",
    url: "https://pubmed.ncbi.nlm.nih.gov/38374703/",
    abstract:
      "Systematic review and meta-analysis of 7 RCTs and 1 quasi-experimental study (854 participants, 60+ years with sarcopenia). Study durations 10-24 weeks. Protein + resistance exercise significantly increased muscle mass (SMD 0.95, p<0.05) and muscle strength (SMD 0.32, p<0.05). Limited number of RCTs restricts conclusion robustness. Conclusion: combination effective for muscle mass and strength in community-dwelling older sarcopenic adults.",
    key_findings:
      "60세 이상 근감소증(sarcopenia) 환자 854명 메타. 단백질 보충 + 저항운동 조합이 근육량과 근력을 분명한 효과로 늘렸어요(SMD 0.95, 0.32). 단 노년 RCT 수가 제한적이라 결론의 강건성에는 한계가 있다고 연구진이 명시.",
    topics: ["단백질", "노인", "근감소증", "저항운동", "보충제"],
    quality_score: 4,
    status: "collected",
    notes: "노인 sarcopenia 시나리오 — 일반인과 다른 권장 근거.",
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
  action: "seed_protein_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ protein sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
