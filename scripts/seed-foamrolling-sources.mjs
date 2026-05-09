// 폼롤러 글용 PubMed 자료 4건 일괄 등록.
// 사용법:  node scripts/seed-foamrolling-sources.mjs

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
const ROADMAP_ORDER = 4;
const PRIMARY_PMID = "32825976";

const PAPERS = [
  {
    pmid: "32825976",
    doi: "10.1016/j.jbmt.2020.01.007",
    source_type: "paper",
    title:
      "A systematic review and meta-analysis of the effects of foam rolling on range of motion, recovery and markers of athletic performance",
    authors: ["Skinner B", "Moss R", "Hammond L"],
    outlet: "Journal of Bodywork and Movement Therapies",
    published_date: "2020-07-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/32825976/",
    abstract:
      "Systematic review and meta-analysis of foam rolling effects on ROM, athletic performance, and recovery. 32 studies included (mean PEDro = 5.56). Meta-analysis on 13 ROM studies (18 datasets): large effect (d = 0.76, 95% CI 0.55-0.98) — foam rolling increases ROM in all studies analyzed. Conclusion: foam rolling increases range of motion, useful for recovery from exercise-induced muscle damage, no detrimental effect on athletic performance. However, except for ROM, cannot conclude foam rolling directly benefits athletic performance. No harm. Equivalent effects in males and females.",
    key_findings:
      "32개 연구를 묶은 종합 메타. 폼롤러는 가동 범위(ROM)를 분명히 늘려요(효과크기 0.76, 큰 수준). 운동 후 회복에도 도움. 다른 운동 능력(점프·근력 등)에는 직접 향상 효과는 없지만 해도 없어요. 남녀 효과 비슷.",
    topics: ["폼롤러", "근막이완", "가동 범위", "회복", "메타분석"],
    quality_score: 4,
    status: "collected",
    notes: "폼롤러 효과 종합 메타 — ROM에 큰 효과, performance에는 미미.",
  },
  {
    pmid: "38760635",
    doi: "10.1007/s40279-024-02041-0",
    source_type: "paper",
    title:
      "Static Stretch Training versus Foam Rolling Training Effects on Range of Motion: A Systematic Review and Meta-Analysis",
    authors: [
      "Konrad A",
      "Alizadeh S",
      "Hadjizadeh Anvar S",
      "Fischer J",
      "Manieu J",
      "Behm DG",
    ],
    outlet: "Sports Medicine",
    published_date: "2024-09-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/38760635/",
    abstract:
      "85 studies (72 static stretching, 13 foam rolling), 204 effect sizes. Random-effect meta-analysis. Static stretch (ES = -1.006, p < 0.001) and foam rolling (ES = -0.729, p = 0.001) both increase joint ROM with moderate magnitude vs control. No significant difference between two methods overall (p = 0.228). However, when intervention duration ≤ 4 weeks: significant ROM change with static stretching (ES = -1.436), but not with foam rolling (ES = -0.229). Subgroup analysis shows static stretching has significant favorable effect over foam rolling for ≤ 4 weeks. Conclusion: both can be similarly recommended for ROM, except for short-term (≤ 4 weeks) where static stretching has advantage.",
    key_findings:
      "85개 연구를 묶은 비교 메타. 폼롤러와 정적 스트레칭 모두 ROM 향상에 효과적이고 장기 효과는 비슷해요. 단 4주 미만 단기에서는 정적 스트레칭이 더 빠르게 효과를 냅니다. 폼롤러는 시간이 좀 더 걸려요.",
    topics: ["폼롤러", "정적 스트레칭", "가동 범위", "비교", "Sports Med"],
    quality_score: 5,
    status: "collected",
    notes: "Sports Med top journal. 폼롤러 vs 스트레칭 비교 — 장기 동등, 단기 스트레칭 우위.",
  },
  {
    pmid: "38244921",
    doi: "10.1016/j.jshs.2024.01.006",
    source_type: "paper",
    title:
      "Foam rolling and stretching do not provide superior acute flexibility and stiffness improvements compared to any other warm-up intervention: A systematic review with meta-analysis",
    authors: [
      "Warneke K",
      "Plöschberger G",
      "Lohmann LH",
      "Lichtenstein E",
      "Jochum D",
      "Siegel SD",
      "Zech A",
      "Behm DG",
    ],
    outlet: "Journal of Sport and Health Science",
    published_date: "2024-07-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/38244921/",
    abstract:
      "Systematic review with meta-analysis: 38 studies, 1134 participants, 140 effect sizes. Compared stretching/foam rolling vs other warm-up interventions on acute ROM and passive properties. Robust variance estimation. Results: no significant differences in ROM (ES = 0.01, p = 0.88), stiffness (ES = 0.09, p = 0.67), or passive peak torque (ES = -0.30, p = 0.14) between stretching/foam rolling and other identified activities. No publication bias. Conclusion: results challenge the established view of stretching and foam rolling as recommended warm-up component. No need to emphasize over other warm-up activities.",
    key_findings:
      "38개 연구·1,134명 메타. 폼롤러나 스트레칭이 다른 워밍업(가벼운 유산소 등)보다 즉각적인 가동 범위·근육 강성 개선에서 더 우월하지 않아요. 즉 워밍업 종류로서 폼롤러를 굳이 고집할 이유는 약합니다.",
    topics: ["폼롤러", "스트레칭", "워밍업", "비교", "메타분석"],
    quality_score: 4,
    status: "collected",
    notes: "워밍업으로서 폼롤러 신화 깨는 메타. 다른 활동과 동등.",
  },
  {
    pmid: "31024339",
    doi: "10.3389/fphys.2019.00376",
    source_type: "paper",
    title: "A Meta-Analysis of the Effects of Foam Rolling on Performance and Recovery",
    authors: [
      "Wiewelhove T",
      "Döweling A",
      "Schneider C",
      "Hottenrott L",
      "Meyer T",
      "Kellmann M",
      "Pfeiffer M",
      "Ferrauti A",
    ],
    outlet: "Frontiers in Physiology",
    published_date: "2019-04-09",
    url: "https://pubmed.ncbi.nlm.nih.gov/31024339/",
    abstract:
      "Meta-analysis comparing foam rolling pre-exercise (warm-up) vs post-exercise (recovery). 21 studies. Pre-rolling: small improvement in sprint (+0.7%, g = 0.28) and flexibility (+4.0%, g = 0.34); negligible effect on jump (-1.9%, g = 0.09) and strength (+1.8%, g = 0.12). Post-rolling: slight attenuation of exercise-induced decreases in sprint (+3.1%, g = 0.34) and strength (+3.9%, g = 0.21); reduced muscle pain perception (+6.0%, g = 0.47); trivial effect on jump (-0.2%). Tendency: foam rollers offer larger effects on strength recovery than roller massagers. Conclusion: effects on performance and recovery are minor and partly negligible, but relevant for sprint, flexibility, and muscle pain reduction. Justifies use as warm-up activity rather than recovery tool.",
    key_findings:
      "21개 연구 메타. 운동 전 폼롤러는 단거리 달리기와 유연성에 작은 향상 효과(0.7~4%). 운동 후 폼롤러는 근육통 인식을 6%, 근력 회복을 약 4% 도와주는 정도예요. 효과 크기는 전반적으로 작거나 미미합니다.",
    topics: ["폼롤러", "워밍업", "회복", "근육통", "운동 효과"],
    quality_score: 4,
    status: "collected",
    notes: "운동 전후 폼롤러 효과 분리 분석 — 양쪽 다 효과 작음을 명시.",
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
  action: "seed_foamrolling_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ foam rolling sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
