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
const ROADMAP_ORDER = 5;
const PRIMARY_PMID = "40120073";

const PAPERS = [
  {
    pmid: "40120073",
    doi: "10.1007/s40279-025-02187-5",
    source_type: "paper",
    title:
      "Physical Therapies for Delayed-Onset Muscle Soreness: An Umbrella and Mapping Systematic Review with Meta-meta-analysis",
    authors: [
      "Wiecha S",
      "Cieśliński I",
      "Wiśniowski P",
      "Cieśliński M",
      "Pawliczek W",
      "Posadzki P",
      "Prill R",
      "Zając J",
      "Płaszewski M",
    ],
    outlet: "Sports Medicine",
    published_date: "2025-05-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/40120073/",
    abstract:
      "Umbrella review with meta-meta-analysis. 29 systematic reviews, 863 unique RCTs, 24 distinct physiotherapeutic treatments. Search 1998-Feb 2024. AMSTAR-2 quality: 17 critically low, 2 high. Evidence map by follow-up time: immediate post-exercise (contrast Class II, cooling/cryostimulation Class IV); 24h (massage Class III, cooling/contrast/electrical/cryostimulation/phototherapy/heat Class IV); 48h (compression/contrast/kinesiotaping/cryostimulation Class III, etc.); 72h (kinesiotaping Class III, contrast/cooling/massage/phototherapy/vibration Class IV); 96h (compression/phototherapy/contrast Class IV). Effect sizes 0.36-1.82 (small to large). Stretching, exercises, electrical stimulation: weak evidence. Conclusion: cooling, cryostimulation, contrast, massage, phototherapy, kinesiotaping have some strong evidence; methodological quality concerns limit applicability.",
    key_findings:
      "29개 메타·863 RCT umbrella. 운동 후 근육통(DOMS) 회복법 24가지를 시점별로 비교했어요. 시점별 분명한 효과: 24시간 후엔 마사지·냉온, 48시간 후엔 압박·냉온교대·키네시오 테이핑, 72시간 후엔 키네시오 테이핑·마사지. 스트레칭·일반 운동·전기 자극은 근거 약함.",
    topics: ["DOMS", "회복", "마사지", "냉온교대", "압박", "umbrella meta"],
    quality_score: 5,
    status: "collected",
    notes: "Sports Med top journal. DOMS 회복법 가장 종합 메타. 첫 글 핵심 인용.",
  },
  {
    pmid: "29755363",
    doi: "10.3389/fphys.2018.00403",
    source_type: "paper",
    title:
      "An Evidence-Based Approach for Choosing Post-exercise Recovery Techniques to Reduce Markers of Muscle Damage, Soreness, Fatigue, and Inflammation: A Systematic Review With Meta-Analysis",
    authors: ["Dupuy O", "Douzi W", "Theurot D", "Bosquet L", "Dugué B"],
    outlet: "Frontiers in Physiology",
    published_date: "2018-04-26",
    url: "https://pubmed.ncbi.nlm.nih.gov/29755363/",
    abstract:
      "Meta-analysis of 99 studies on post-exercise recovery techniques. Active recovery, massage, compression garments, immersion, contrast water therapy, and cryotherapy induced small to large decrease in DOMS magnitude (-2.26 < g < -0.40). Massage most powerful for DOMS and fatigue. Moderate decrease in creatine kinase (-0.37), small decreases in IL-6 (-0.36) and CRP (-0.38). Massage and cold exposure most powerful for inflammation. Conclusion: massage most effective for DOMS and perceived fatigue.",
    key_findings:
      "99개 연구 메타. 능동 회복(가벼운 운동), 마사지, 압박 의류, 수중 침수, 냉온교대, 냉찜질이 DOMS를 작거나 큰 폭으로 줄였어요. 마사지가 가장 강력. 염증 지표(CK·IL-6·CRP)도 마사지와 냉온이 가장 효과적.",
    topics: ["회복", "마사지", "능동 회복", "냉찜질", "압박 의류", "DOMS"],
    quality_score: 4,
    status: "collected",
    notes: "회복법 비교 종합 메타. 마사지의 가장 큰 효과를 정량화.",
  },
  {
    pmid: "37462808",
    doi: "10.1186/s40798-023-00599-z",
    source_type: "paper",
    title:
      "The Impact of Sleep Interventions on Athletic Performance: A Systematic Review",
    authors: [
      "Cunha LA",
      "Costa JA",
      "Marques EA",
      "Brito J",
      "Lastella M",
      "Figueiredo P",
    ],
    outlet: "Sports Medicine Open",
    published_date: "2023-07-18",
    url: "https://pubmed.ncbi.nlm.nih.gov/37462808/",
    abstract:
      "Systematic review of sleep interventions for athletic performance. 25 intervention studies (2011-2021). Sleep extension and naps most representative and effective strategies for improving sleep and performance. Mindfulness and light manipulation showed promising results, more studies needed. Sleep hygiene, removing electronic devices at night, and cold water immersion had no effects on sleep and subsequent performance/recovery. Conclusion: increasing sleep duration at night or through napping most effective for physical/cognitive performance.",
    key_findings:
      "25개 중재 연구 메타. 운동 회복에 가장 효과적인 수면 중재는 '잠 시간 늘리기'와 '낮잠'이었어요. 수면 위생, 야간 전자기기 제한, 냉수 침수는 수면이나 후속 회복에 통계적으로 분명한 효과 안 보임. 즉 단순히 자는 시간을 늘리는 게 가장 강력.",
    topics: ["수면", "회복", "수면 연장", "낮잠", "운동 수행"],
    quality_score: 4,
    status: "collected",
    notes: "수면 중재 효과 비교 — 운동 회복 측면에서 핵심.",
  },
  {
    pmid: "34074604",
    doi: "10.1016/j.jsams.2021.05.007",
    source_type: "paper",
    title: "How does sleep help recovery from exercise-induced muscle injuries?",
    authors: [
      "Chennaoui M",
      "Vanneau T",
      "Trignol A",
      "Arnal P",
      "Gomez-Merino D",
      "Baudot C",
      "Perez J",
      "Pochettino S",
      "Eirale C",
      "Chalabi H",
    ],
    outlet: "Journal of Science and Medicine in Sport",
    published_date: "2021-10-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/34074604/",
    abstract:
      "Narrative review on sleep and exercise-induced muscle injury recovery. Sleep extension improved performance, pain sensitivity, and GH/IGF-I anabolic responses, beneficial in accelerating recovery from muscle injuries. Reviews role of sleep and circadian system for hormonal/immune regulation, sleep in athletes/soldiers and injury risk, phases of muscle regeneration, deleterious effects of sleep deprivation on muscle tissue, and benefits of sleep interventions. Sleep extension could help/prevent recovery from exercise-induced muscle injuries through increasing local IGF-I and controlling local inflammation.",
    key_findings:
      "수면이 운동 후 근육 회복을 돕는 메커니즘 narrative review. 수면 부족은 코르티솔 상승·테스토스테론·성장호르몬 감소를 일으키고, 근손상 회복을 늦추는 것으로 보고됐어요. 수면 시간 늘리기(sleep extension)가 IGF-I(근육 성장 호르몬)과 염증 조절에 도움.",
    topics: ["수면", "근손상 회복", "성장호르몬", "IGF-I", "코르티솔"],
    quality_score: 3,
    status: "collected",
    notes: "수면-회복 메커니즘 narrative — 정량 메타는 아니지만 권위 있는 종설.",
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
  action: "seed_recovery_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ recovery sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
