// 운동 전/후 스트레칭 글용 PubMed 자료 4건 일괄 등록.
// 검증 일자: 2026-05-09
// 사용법:  node scripts/seed-stretching-sources.mjs

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
const ROADMAP_ORDER = 2;
const PRIMARY_PMID = "37644585";

const PAPERS = [
  {
    pmid: "37644585",
    doi: "10.1186/s13102-023-00703-6",
    source_type: "paper",
    title:
      "A systematic review and net meta-analysis of the effects of different warm-up methods on the acute effects of lower limb explosive strength",
    authors: ["Li FY", "Guo CG", "Li HS", "Xu HR", "Sun P"],
    outlet: "BMC Sports Science, Medicine and Rehabilitation",
    published_date: "2023-08-29",
    url: "https://pubmed.ncbi.nlm.nih.gov/37644585/",
    abstract:
      "Network meta-analysis of 35 studies examining warm-up methods on acute lower limb explosive strength. Static combined with dynamic stretching (MD = 1.80) and dynamic stretching alone (MD = 1.60) significantly improved countermovement jump height vs controls. Dynamic stretching most stable with optimal duration 7-10 min. Only dynamic stretching significantly improved sprint time (MD = -0.08); static stretching showed significant negative effect on sprint (MD = 0.07). Foam rolling not significantly different from controls. Conclusion: static stretching reduces explosive performance; dynamic stretching or static+dynamic combined improves it.",
    key_findings:
      "35개 연구 네트워크 메타. 운동 전 정적 스트레칭만 하면 점프 높이·스프린트 시간이 약간 떨어졌고, 동적 스트레칭이나 정적+동적 조합은 점프력을 분명히 높였어요. 동적 스트레칭은 7~10분이 가장 효과적. 폼롤러는 통계적으로 차이 없음.",
    topics: ["스트레칭", "워밍업", "동적 스트레칭", "정적 스트레칭", "네트워크 메타"],
    quality_score: 4,
    status: "collected",
    notes: "워밍업 비교 핵심 메타. 정적 vs 동적 우열 명확.",
  },
  {
    pmid: "39614059",
    doi: "10.1007/s40279-024-02143-9",
    source_type: "paper",
    title:
      "Optimising the Dose of Static Stretching to Improve Flexibility: A Systematic Review, Meta-analysis and Multivariate Meta-regression",
    authors: [
      "Ingram LA",
      "Tomkinson GR",
      "d'Unienville NMA",
      "Gower B",
      "Gleadhill S",
      "Boyle T",
      "Bennett H",
    ],
    outlet: "Sports Medicine",
    published_date: "2025-03-01",
    url: "https://pubmed.ncbi.nlm.nih.gov/39614059/",
    abstract:
      "Multi-level meta-analysis of 189 studies, 6,654 adults. Acute static stretching showed moderate positive effect on flexibility (Hedges' g = 0.63); chronic static stretching showed large positive effect (g = 0.96). Effects not moderated by intensity, age, sex, training status, frequency, or intervention length. Adults with poor baseline flexibility showed greater improvements. Improvements maximised by cumulative volume of 4 min/session (acute) and 10 min/week (chronic). No additional benefit beyond these volumes.",
    key_findings:
      "189편 6,654명 대상 대규모 메타. 정적 스트레칭은 유연성을 분명히 높여요. 한 세션에 4분, 주당 10분이면 충분하고 그 이상은 추가 효과 없음. 강도·나이·성별과 무관하게 효과가 나타나며, 평소 유연성이 낮은 사람일수록 효과가 더 큽니다.",
    topics: ["스트레칭", "유연성", "정적 스트레칭", "용량", "Sports Med"],
    quality_score: 5,
    status: "collected",
    notes: "Sports Medicine top journal. 정적 스트레칭의 진짜 자리 — 유연성 향상.",
  },
  {
    pmid: "34025459",
    doi: "10.3389/fphys.2021.677581",
    source_type: "paper",
    title:
      "The Effectiveness of Post-exercise Stretching in Short-Term and Delayed Recovery of Strength, Range of Motion and Delayed Onset Muscle Soreness: A Systematic Review and Meta-Analysis of Randomized Controlled Trials",
    authors: [
      "Afonso J",
      "Clemente FM",
      "Nakamura FY",
      "Morouço P",
      "Sarmento H",
      "Inman RA",
      "Ramirez-Campillo R",
    ],
    outlet: "Frontiers in Physiology",
    published_date: "2021-05-05",
    url: "https://pubmed.ncbi.nlm.nih.gov/34025459/",
    abstract:
      "Systematic review and meta-analysis of 11 RCTs (10 in meta-analysis, n=229) on post-exercise stretching effects on strength recovery, ROM, and DOMS. Compared static, passive, PNF stretching to passive recovery or alternative methods. Risk of bias high in ~70% of studies. No significant effect of post-exercise stretching on strength recovery (ES = -0.08, p = 0.750). No effect on 24/48/72-h post-exercise DOMS (ES = -0.09 to -0.24). Conclusion: insufficient evidence to recommend post-exercise stretching for recovery purposes.",
    key_findings:
      "11개 임상시험 229명 메타. 운동 후 스트레칭이 24·48·72시간 후 근육통(DOMS)을 통계적으로 분명히 줄여주지는 못했어요. 그냥 가만히 쉬는 것과 차이 없음. 즉 '운동 후 스트레칭하면 근육통이 덜 온다'는 통념의 근거가 약합니다.",
    topics: ["스트레칭", "운동 후 회복", "DOMS", "근육통"],
    quality_score: 4,
    status: "collected",
    notes: "운동 후 스트레칭 신화 깨는 메타. DOMS 회복 효과 없음.",
  },
  {
    pmid: "38595642",
    doi: "10.3389/fphys.2024.1372689",
    source_type: "paper",
    title:
      "Effects of chronic static stretching interventions on jumping and sprinting performance-a systematic review with multilevel meta-analysis",
    authors: [
      "Warneke K",
      "Freundorfer P",
      "Plöschberger G",
      "Behm DG",
      "Konrad A",
      "Schmidt T",
    ],
    outlet: "Frontiers in Physiology",
    published_date: "2024-03-26",
    url: "https://pubmed.ncbi.nlm.nih.gov/38595642/",
    abstract:
      "Systematic review with multilevel meta-analysis of chronic static stretching effects on jumping and sprinting performance. 14 studies, 29 effect sizes (20 jumping, 9 sprinting). 6/20 jump tests positive, 6/9 sprint tests positive, 2 studies negative. Quantitative analysis: small positive but trivial effect on jumping (ES = 0.16, p = 0.04). No significant effect on sprint (p = 0.08). Conclusion: chronic static stretching does not provide sufficient stimulus to meaningfully enhance jumping or sprinting performance, possibly due to small weekly training volumes or lack of intensity.",
    key_findings:
      "14개 연구의 다층 메타. 장기간 정적 스트레칭이 점프 성적은 미세하게 올렸지만(효과 0.16) 실질적으로 의미 있는 수준은 아니었고, 스프린트 성적은 변화 없음. 즉 정적 스트레칭만으로 폭발력이 좋아질 거라는 기대는 줄여야 합니다.",
    topics: ["스트레칭", "정적 스트레칭", "점프", "스프린트", "장기 효과"],
    quality_score: 4,
    status: "collected",
    notes: "정적 스트레칭의 한계 — 만성 적용도 폭발력에는 큰 영향 없음.",
  },
];

const { data: topic } = await sb
  .from("health_topics")
  .select("id, cluster_roadmap")
  .eq("slug", TOPIC_SLUG)
  .single();
if (!topic) throw new Error(`topic ${TOPIC_SLUG} not found`);

const pmids = PAPERS.map((p) => p.pmid);
const { data: existing } = await sb
  .from("health_sources")
  .select("pmid")
  .in("pmid", pmids);
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
  action: "seed_stretching_sources",
  target_type: "health_topics",
  target_id: topic.id,
  payload: { topic_slug: TOPIC_SLUG, pmids, inserted: toInsert.length, already_existed: existingPmids.size },
});

console.log(`\n✅ stretching sources seeded`);
console.log(`   roadmap #${ROADMAP_ORDER} primary_source_pmid: ${PRIMARY_PMID} (status: planned)`);
