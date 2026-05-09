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
const ROADMAP_ORDER = 5;
const PRIMARY_PMID = "36502286";

const PAPERS = [
  {
    pmid: "36502286",
    doi: "10.1002/oby.23605",
    source_type: "paper",
    title:
      "The efficacy of morning versus evening exercise for weight loss: A randomized controlled trial",
    authors: ["Brooker PG", "Gomersall SR", "King NA", "Leveritt MD"],
    outlet: "Obesity (Silver Spring)",
    published_date: "2023-01-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/36502286/",
    abstract:
      "RCT of 100 inactive adults with overweight or obesity randomized to morning (06:00-09:00), evening (16:00-19:00), or wait-list control. 250 min/week self-paced aerobic exercise for 12 weeks. Both morning and evening groups lost weight (AMEx -2.7 kg, PMEx -3.1 kg). VO2peak significantly increased in both groups vs control. No between-group differences in resting metabolic rate or physical activity. Total energy intake reduced similarly in both. Conclusion: Adults with overweight/obesity experience modest weight loss in response to exercise program, but no optimal time to exercise.",
    key_findings:
      "100명 12주 RCT. 아침 운동(2.7kg 감량)과 저녁 운동(3.1kg 감량) 둘 다 분명한 체중 감소. 통계적으로 두 그룹 간 차이 없음. 심폐 적합도 향상도 비슷. 결론: 체중 감량만 보면 운동 시간대는 큰 변수가 아니에요.",
    topics: ["운동 시간대", "아침 운동", "저녁 운동", "체중 감량", "RCT"],
    quality_score: 4,
    status: "collected",
    notes: "체중 감량 직접 비교 — 시간대 차이 없음을 RCT로 확인.",
  },
  {
    pmid: "30704301",
    doi: "10.1080/07420528.2019.1567524",
    source_type: "paper",
    title:
      "The effects of time of day-specific resistance training on adaptations in skeletal muscle hypertrophy and muscle strength: A systematic review and meta-analysis",
    authors: [
      "Grgic J",
      "Lazinica B",
      "Garofolini A",
      "Schoenfeld BJ",
      "Saner NJ",
      "Mikulic P",
    ],
    outlet: "Chronobiology International",
    published_date: "2019-04-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/30704301/",
    abstract:
      "Systematic review and meta-analysis of time of day-specific resistance training on muscle strength and hypertrophy. 11 studies of moderate and good methodological quality. Findings: (1) baseline strength is greater in evening than morning; (2) morning training increases morning strength to evening levels; (3) evening training maintains the daily difference; (4) overall strength gains are similar between morning and evening groups regardless of assessment time; (5) muscle hypertrophy gains are similar irrespective of training time of day.",
    key_findings:
      "11개 연구 메타. 저항운동 시간대(아침 vs 저녁)는 근력·근비대 효과에서 통계적 차이 없음. 단 같은 사람이라도 저녁에 측정한 근력이 아침보다 약간 높은 자연 패턴이 있는데, 아침에 훈련하면 그 차이가 줄어들어요.",
    topics: ["운동 시간대", "저항운동", "근력", "근비대", "메타분석"],
    quality_score: 4,
    status: "collected",
    notes: "근력·근비대 효과 시간대 메타. 차이 없음을 분명히 확인.",
  },
  {
    pmid: "40419564",
    doi: "10.1038/s41598-025-02659-8",
    source_type: "paper",
    title:
      "Differential benefits of 12-week morning vs. evening aerobic exercise on sleep and cardiometabolic health: a randomized controlled trial",
    authors: ["Shen B", "Zheng H", "Liu H", "Chen L", "Yang G"],
    outlet: "Scientific Reports",
    published_date: "2025-05-26",
    url: "https://pubmed.ncbi.nlm.nih.gov/40419564/",
    abstract:
      "12-week RCT in 58 sedentary males: morning exercise (6-8 a.m.), evening exercise (6-8 p.m.), or control. Moderate-intensity aerobic ≥150 min/week. Sleep assessed via Munich ChronoType Questionnaire and Dim Light Melatonin Onset. Both exercise groups reduced body fat, with morning showing significant reductions as early as week 4. Total cholesterol and triglycerides decreased in morning. Shortened sleep latency in both, with sleep-wake cycle advanced in morning. Both showed decreased arterial stiffness and increased wall shear stress, but evening showed greater enhancements in blood flow rate, carotid dilation, and lower systolic BP. Conclusion: morning exercise more effective for rapid body fat reduction and lipid improvement; evening exercise better for vascular function.",
    key_findings:
      "58명 12주 RCT. 아침 운동은 체지방·콜레스테롤·중성지방 감소가 더 빨랐고 수면 사이클을 앞당겼어요. 저녁 운동은 혈관 기능·혈류·수축기 혈압 개선에서 더 우수. 즉 outcome별로 강점이 다릅니다.",
    topics: ["운동 시간대", "수면", "심혈관", "체지방", "RCT"],
    quality_score: 4,
    status: "collected",
    notes: "최신(2025) RCT — outcome별 시간대 차이 분명히 보고.",
  },
  {
    pmid: "35711313",
    doi: "10.3389/fphys.2022.893783",
    source_type: "paper",
    title:
      "Morning Exercise Reduces Abdominal Fat and Blood Pressure in Women; Evening Exercise Increases Muscular Performance in Women and Lowers Blood Pressure in Men",
    authors: [
      "Arciero PJ",
      "Ives SJ",
      "Mohr AE",
      "Robinson N",
      "Escudero D",
      "Robinson J",
      "Rose K",
      "Minicucci O",
      "O'Brien G",
      "Curran K",
      "Miller VJ",
      "He F",
      "Norton C",
      "Paul M",
      "Sheridan C",
      "Beard S",
      "Centore J",
      "Dudar M",
      "Ehnstrom K",
      "Hoyte D",
      "Mak H",
      "Yarde A",
    ],
    outlet: "Frontiers in Physiology",
    published_date: "2022-05-31",
    url: "https://pubmed.ncbi.nlm.nih.gov/35711313/",
    abstract:
      "12-week RCT: 30 trained women + 26 trained men randomized to AM (0600-0800) or PM (1830-2030) multimodal exercise, analyzed separately. In women: AM reduced abdominal fat (-2.6 kg vs -0.9 kg PM), reduced systolic BP (-12.5 mmHg vs +2.3 PM); PM enhanced muscular performance (1RM bench, pushups, BT, SJ). In men: PM showed greater systolic BP reduction (-14.9 vs -3.5 AM), greater fat oxidation (RER), reduced fatigue. Macronutrient intake similar between groups. Conclusion: ETOD (exercise time of day) may be important for individual outcomes and may be independent of macronutrient intake.",
    key_findings:
      "성별 분리 RCT. 여성은 아침 운동에서 복부지방·혈압 감소가 분명, 저녁 운동에서 근력·파워 향상이 분명. 남성은 저녁 운동에서 수축기 혈압 감소·지방 산화·피로 감소가 분명. 즉 성별과 outcome 따라 시간대 강점이 갈립니다.",
    topics: ["운동 시간대", "성별 차이", "복부지방", "혈압", "근력"],
    quality_score: 3,
    status: "collected",
    notes: "성별 outcome별 시간대 차이 — 작은 sample(56명)이지만 의미 있는 패턴.",
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
  action: "seed_exercise_time_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ exercise time sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID}`);
