// 운동·헬스 토픽 첫 글(strength-vs-cardio-fat-loss)용 PubMed 자료 4건 일괄 등록.
// 모든 메타데이터는 PubMed 페이지에서 fetch 검증 (2026-05-09).
// 이미 등록된 PMID 는 skip — 멱등.
//
// 사용법:  node scripts/seed-fitness-sources.mjs

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
const ACTOR = "anseunghyok@gmail.com";
const TOPIC_SLUG = "fitness-foundation";

const PAPERS = [
  {
    pmid: "40405489",
    doi: "10.1080/15502783.2025.2507949",
    source_type: "paper",
    title:
      "Comparison of concurrent, resistance, or aerobic training on body fat loss: a systematic review and meta-analysis",
    authors: [
      "Lafontant K",
      "Rukstela A",
      "Hanson A",
      "Chan J",
      "Alsayed Y",
      "Ayers-Creech WA",
      "Bale C",
      "Ohigashi Y",
      "Solis J",
      "Shelton G",
      "Alur I",
      "Resler C",
      "Heath A",
      "Ericksen S",
      "Forbes SC",
      "Campbell BI",
    ],
    outlet: "Journal of the International Society of Sports Nutrition",
    published_date: "2025-05-22",
    url: "https://pubmed.ncbi.nlm.nih.gov/40405489/",
    abstract:
      "Systematic review and meta-analysis comparing resistance training (RT), aerobic training (AT), and concurrent training (CT) effects on body fat loss in healthy adults. Thirty-six studies with 1564 participants were analyzed. For interventions lasting ≥10 weeks, AT outperformed RT in reducing body mass and fat mass but resulted in less fat-free mass retention. CT reduced significantly more fat mass than RT alone. No significant differences emerged between modalities regarding body fat percentage changes. For studies <10 weeks, no meaningful differences appeared across exercise types. When workloads were equated, similar outcomes occurred between modalities. Same-day versus different-day CT scheduling showed comparable results.",
    key_findings:
      "36개 RCT 1,564명 대상 메타분석. 10주 이상 중재에서 유산소(AT)가 저항운동(RT)보다 체중·체지방 감소가 더 컸지만 제지방량 손실도 더 많았음. 복합운동(CT)은 RT 단독보다 체지방 감소 효과가 더 컸음. 체지방률 변화에서는 종목 간 유의차 없음. 운동 부하를 동일하게 통제하면 모달리티 간 결과 비슷. 결론: 체지방 감량 + 근육 보존을 동시에 원하면 복합운동이 최선이며, 운동 부하와 기간이 결과를 좌우.",
    topics: ["근력 운동", "유산소", "복합운동", "체지방 감량", "메타분석"],
    quality_score: 4,
    status: "collected",
    notes: "첫 글의 핵심 인용 — 본문 메인 비교 근거.",
  },
  {
    pmid: "38878596",
    doi: "10.1016/j.archger.2024.105530",
    source_type: "paper",
    title:
      "Effect of aerobic training versus resistance training for improving cardiorespiratory fitness and body composition in middle-aged to older adults: A systematic review and meta-analysis of randomized controlled trials",
    authors: ["An J", "Su Z", "Meng S"],
    outlet: "Archives of Gerontology and Geriatrics",
    published_date: "2024-11-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/38878596/",
    abstract:
      "Systematic review and meta-analysis examining the influence of aerobic training (AT) versus resistance training (RT) on cardiorespiratory fitness and body composition in middle-aged to older adults. Searched four electronic databases through April 2024. Thirty-eight RCTs with a pooled sample of 1682 participants. AT significantly improved VO2max/peak (MD = 1.80, 95% CI 0.96–2.64, p < 0.0001) and 6-MWT (MD = 18.58, 95% CI 10.38–26.78, p < 0.00001), and significantly decreased body mass (MD = -1.23, 95% CI -1.98 to -0.47, p = 0.001) versus RT. Changes in lean body mass favored RT over AT. Improvements were significant in both healthy and unhealthy participants, men and women, after medium-term (<24 weeks) and long-term (≥24 weeks) interventions, in participants ≤65 and >65 years.",
    key_findings:
      "중년~노년 1,682명 대상 38개 RCT 메타분석. AT가 RT 대비 VO2max·6분 보행거리·체중 감소에서 유의하게 우수(체중 MD -1.23 kg, p=0.001). 그러나 제지방량 증가는 RT가 더 우수. 24주 미만/이상, 65세 이하/이상 모두에서 일관된 결과. 결론: 종합적 적합도와 체구성 개선에는 AT+RT 복합이 최적.",
    topics: ["유산소", "근력 운동", "노년", "심폐 적합도", "메타분석"],
    quality_score: 4,
    status: "collected",
    notes: "노년/중년 별 비교 근거. 첫 글 후반부 '연령별 권장' 섹션 자료.",
  },
  {
    pmid: "38031812",
    doi: "10.1111/obr.13666",
    source_type: "paper",
    title:
      "Effects of various exercise types on visceral adipose tissue in individuals with overweight and obesity: A systematic review and network meta-analysis of 84 randomized controlled trials",
    authors: ["Chen X", "He H", "Xie K", "Zhang L", "Cao C"],
    outlet: "Obesity Reviews",
    published_date: "2024-03-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/38031812/",
    abstract:
      "Systematic review and network meta-analysis of randomized controlled trials investigating the effects of various exercise categories on visceral adipose tissue (VAT) and other anthropometric variables in individuals with overweight and obesity. 84 RCTs (4836 patients) were included. Aerobic exercise (AE) of at least moderate intensity, resistance training (RT), AE combined with RT (AE + RT), and high-intensity interval training (HIIT) were beneficial for reducing VAT. Subgroup analysis showed RT improves VAT in males and BF% < 40% but not in females and BF% ≥ 40%. AE, RT, AE+RT, and HIIT significantly improved weight (except RT), TBF, BMI, WC, and SAT. SUCRA ranking showed vigorous-intensity AE and HIIT have the highest probability of being the best exercise intervention for improving VAT, weight, TBF, BMI, WC, and SAT. RT was the least effective intervention.",
    key_findings:
      "과체중·비만 4,836명 대상 84개 RCT 네트워크 메타분석. 내장지방(VAT) 감소에는 중강도 이상 AT, RT, 복합운동, HIIT 모두 효과적. SUCRA 순위에서 격렬 강도 AT와 HIIT가 VAT·체중·체지방·허리둘레 개선 1순위. RT 단독은 VAT 감소에서 가장 약했지만, 남성·체지방률 40% 미만 그룹에서는 RT도 VAT 감소 효과 보임. 결론: VAT 감량 우선이면 격렬 AT/HIIT, 체구성 종합 개선에는 복합운동.",
    topics: ["내장지방", "유산소", "HIIT", "근력 운동", "네트워크 메타"],
    quality_score: 4,
    status: "collected",
    notes: "84 RCT network meta — 운동 종류 우열 SUCRA 순위 시각화 자료.",
  },
  {
    pmid: "39064615",
    doi: "10.3390/medicina60071186",
    source_type: "paper",
    title:
      "Effects of Exercise Type on Muscle Strength and Body Composition in Men and Women: A Systematic Review and Meta-Analysis",
    authors: ["Noh K", "Seo E", "Park S"],
    outlet: "Medicina (Kaunas, Lithuania)",
    published_date: "2024-07-22",
    url: "https://pubmed.ncbi.nlm.nih.gov/39064615/",
    abstract:
      "Background: Limited research investigates exercise effects based on sex differences. Aim: compare effects of exercise types on muscle strength and body composition in men and women through a meta-analysis. Methods: Systematic literature search of PubMed/Medline, Web of Science, CINAHL, EBSCO. Standardized mean difference (SMD) reported separately for men and women. Results: Concurrent training showed greatest effect on leg press strength in men; resistance training greatest in women. Concurrent training greatest effect size in both sexes for bench press strength. Resistance and concurrent training showed small effect on lean mass reduction. Endurance and concurrent training significantly reduced fat mass in men; no significant changes in fat mass in women across any type. Conclusions: Concurrent training most efficient for men; resistance training most effective for muscle strength in females; endurance training most effective for fat reduction in females.",
    key_findings:
      "성별 차이 메타분석. 남성: 복합운동이 상·하체 근력·근량·체지방 감소 모두에서 가장 효과적. 여성: RT가 근력 증가에 가장 효과적, 유산소가 체지방 감소에 더 유리. 단 여성에서는 어떤 운동 종류도 체지방 감소가 통계적으로 유의하지 않았음(샘플 수 한계). 결론: 운동 처방은 성별·운동 경험에 맞춰 조정 필요.",
    topics: ["성별 차이", "근력 운동", "유산소", "복합운동"],
    quality_score: 3,
    status: "collected",
    notes:
      "성별별 운동 반응 차이 — 첫 글 '성별별 권장' 섹션 자료. 여성 데이터 한계 명시 필요.",
  },
];

async function run() {
  console.log("[1/4] resolve topic id");
  const { data: topic, error: topicErr } = await sb
    .from("health_topics")
    .select("id")
    .eq("slug", TOPIC_SLUG)
    .single();
  if (topicErr) throw topicErr;
  console.log("    topic id:", topic.id);

  console.log("[2/4] check existing PMIDs");
  const pmids = PAPERS.map((p) => p.pmid);
  const { data: existing } = await sb
    .from("health_sources")
    .select("pmid")
    .in("pmid", pmids);
  const existingPmids = new Set((existing ?? []).map((r) => r.pmid));
  const toInsert = PAPERS.filter((p) => !existingPmids.has(p.pmid));
  console.log(`    skip ${existingPmids.size}, insert ${toInsert.length}`);

  let inserted = [];
  if (toInsert.length > 0) {
    console.log("[3/4] insert new papers");
    const rows = toInsert.map((p) => ({
      ...p,
      topic_id: topic.id,
      collected_by: ACTOR,
    }));
    const { data, error } = await sb
      .from("health_sources")
      .insert(rows)
      .select("id, pmid, title");
    if (error) throw error;
    inserted = data ?? [];
    for (const r of inserted) {
      console.log(`    + ${r.pmid}  ${r.title.slice(0, 70)}…`);
    }
  } else {
    console.log("[3/4] all 4 already in DB — skipping insert");
  }

  // 기존 row 도 topic_id 갱신 (이전에 다른 토픽으로 들어간 경우 대비)
  if (existingPmids.size > 0) {
    await sb
      .from("health_sources")
      .update({ topic_id: topic.id })
      .in("pmid", [...existingPmids]);
  }

  console.log("[4/4] update cluster_roadmap primary_source_pmid + audit log");
  // roadmap order=1 글에 primary source 박기 (최강 비교 RCT — 40405489)
  const { data: t } = await sb
    .from("health_topics")
    .select("cluster_roadmap")
    .eq("id", topic.id)
    .single();
  const roadmap = (t?.cluster_roadmap ?? []).map((r) =>
    r.order === 1
      ? { ...r, primary_source_pmid: "40405489", status: "planned" }
      : r
  );
  await sb
    .from("health_topics")
    .update({ cluster_roadmap: roadmap })
    .eq("id", topic.id);

  await sb.from("health_admin_actions").insert({
    actor_email: ACTOR,
    action: "seed_fitness_sources",
    target_type: "health_topics",
    target_id: topic.id,
    payload: {
      topic_slug: TOPIC_SLUG,
      pmids,
      inserted: inserted.length,
      already_existed: existingPmids.size,
    },
  });

  console.log("\n✅ done");
  console.log("   topic:", topic.id, TOPIC_SLUG);
  console.log("   sources total:", pmids.length, `(new ${inserted.length} / existing ${existingPmids.size})`);
  console.log("   roadmap #1 primary_source_pmid: 40405489 (status: planned)");
}

await run().catch((e) => {
  console.error("\n❌ failed:", e.message ?? e);
  if (e.details) console.error("   details:", e.details);
  if (e.hint) console.error("   hint:", e.hint);
  process.exit(1);
});
