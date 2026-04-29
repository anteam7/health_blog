// 다이어트 관련 의료 논문 7건을 health_sources 에 일괄 등록.
// 모든 메타데이터는 PubMed 에서 검증된 것 (2026-04-29 수집).
// 사용법:
//   node scripts/seed-diet-sources.mjs
// (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 가 .env.local 또는 셸 env 에 있어야 함)

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// .env.local 자동 로드
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
  } catch {
    // .env.local 없으면 셸 env 만
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const COLLECTOR = "anseunghyok@gmail.com";

const PAPERS = [
  {
    source_type: "paper",
    title:
      "Tirzepatide as Compared with Semaglutide for the Treatment of Obesity",
    url: "https://pubmed.ncbi.nlm.nih.gov/40353578/",
    doi: "10.1056/NEJMoa2416394",
    pmid: "40353578",
    authors: [
      "Aronne LJ", "Horn DB", "le Roux CW", "Ho W", "Falcon BL",
      "Gomez Valderas E", "Das S", "Lee CJ", "Glass LC", "Senyucel C", "Dunn JP",
    ],
    outlet: "New England Journal of Medicine",
    published_date: "2025-07-01",
    abstract:
      "Phase 3b open-label trial. 751 adults with obesity but without type 2 diabetes randomized 1:1 to maximum tolerated dose of tirzepatide (10 or 15 mg) vs semaglutide (1.7 or 2.4 mg) subcutaneously once weekly for 72 weeks. Primary end point: percent change in weight from baseline to week 72. Least-squares mean percent weight change at week 72: -20.2% (tirzepatide) vs -13.7% (semaglutide), P<0.001. Waist circumference change: -18.4 cm vs -13.0 cm, P<0.001. Tirzepatide group more likely to achieve weight reductions of ≥10/15/20/25%. Most adverse events GI, mild-to-moderate, primarily during dose escalation.",
    key_findings:
      "비당뇨 비만 성인에서 tirzepatide 가 semaglutide 보다 체중 감량에 우월. 72주 시점 평균 체중 감소 -20.2% (tirzepatide) 대 -13.7% (semaglutide). 허리둘레도 더 크게 감소. 부작용은 양측 모두 위장관 증상이 흔하나 대부분 경증/중등도이고 용량 증량기에 발생. SURMOUNT-5 연구 — GLP-1/GIP 이중 작용제 우위 직접 비교 근거.",
    topics: ["다이어트", "비만", "GLP-1", "약물치료", "tirzepatide", "semaglutide"],
    quality_score: 5,
    status: "collected",
    notes: "Phase 3b RCT. 직접 비교 trial. AdSense 콘텐츠 신뢰도 높음. 의료 disclaimer 필수 — 의사 처방 전제 약물.",
  },
  {
    source_type: "paper",
    title:
      "Intermittent fasting strategies and their effects on body weight and other cardiometabolic risk factors: systematic review and network meta-analysis of randomised clinical trials",
    url: "https://pubmed.ncbi.nlm.nih.gov/40533200/",
    doi: "10.1136/bmj-2024-082007",
    pmid: "40533200",
    authors: [
      "Semnani-Azad Z", "Khan TA", "Chiavaroli L", "Chen V", "Bhatt HA",
      "Chen A", "Chiang N", "Oguntala J", "Kabisch S", "Lau DCW",
      "Wharton S", "Sharma AM", "Harris L", "Leiter LA", "Hill JO",
      "Hu FB", "Lean MEJ", "Kahleová H", "Rahelic D", "Salas-Salvadó J",
      "Kendall CWC", "Sievenpiper JL",
    ],
    outlet: "BMJ",
    published_date: "2025-06-01",
    abstract:
      "Systematic review and network meta-analysis. 99 RCTs, 6582 adults. Compared alternate day fasting (ADF), time-restricted eating (TRE), whole day fasting, continuous energy restriction (CER), and ad-libitum diets. All IF and CER reduced body weight vs ad-libitum. Compared with CER, ADF was the only IF strategy showing additional weight benefit (mean difference -1.29 kg, 95% CI -1.99 to -0.59, moderate certainty). ADF lowered total cholesterol, triglycerides, non-HDL vs TRE. Long-duration trials (≥24 weeks, n=17) showed benefits only vs ad-libitum, not between strategies. No differences in HbA1c or HDL across IF/CER/ad-libitum.",
    key_findings:
      "간헐적 단식과 지속적 칼로리 제한 모두 ad-libitum 대비 체중 감소 효과. 다만 간헐적 단식 중 alternate day fasting(격일 단식)만이 지속적 칼로리 제한 대비 약 1.3kg 추가 감소를 보임. Time-restricted eating(시간제한 식이)은 지속적 칼로리 제한과 유사. 24주 이상 장기 연구에서는 전략 간 차이가 사라짐 — 결국 칼로리 적자가 핵심. 99개 RCT, 6582명의 강력한 근거.",
    topics: ["간헐적 단식", "다이어트", "시간제한 식이", "alternate-day-fasting", "칼로리 제한"],
    quality_score: 5,
    status: "collected",
    notes: "BMJ 2025. Network meta-analysis — 가장 강한 evidence tier. AdSense 안전.",
  },
  {
    source_type: "paper",
    title:
      "Effects of the Mediterranean diet on the secondary prevention of cardiovascular diseases: a systematic review of randomised controlled trials",
    url: "https://pubmed.ncbi.nlm.nih.gov/40011219/",
    doi: "10.1080/09637486.2025.2466111",
    pmid: "40011219",
    authors: ["Molani-Gol R", "Rafraf M"],
    outlet: "International Journal of Food Sciences and Nutrition",
    published_date: "2025-05-01",
    abstract:
      "Systematic review through January 2025. 16 RCTs on Mediterranean diet for cardiovascular disease secondary prevention; 15 supported beneficial role. Patients on Mediterranean diet had fewer cardiac deaths, MI, and related events vs low-fat diets. Improvements in cholesterol profiles, arterial function, endothelial progenitor cell markers. Both diet groups showed comparable improvements in BP and weight.",
    key_findings:
      "심혈관 질환을 이미 가진 환자에게 지중해식 식단(올리브유·견과·생선·통곡물 위주)이 2차 예방에 효과적. 16개 RCT 중 15개에서 유의한 이득 — 심장사망, 심근경색, 관련 사건 감소. 콜레스테롤·동맥기능·내피전구세포 지표 개선. 혈압·체중은 저지방 식단과 유사 — 차별점은 심혈관 사건 자체 감소. 1차 예방(건강인) 보다 2차 예방(환자) 데이터가 더 강력.",
    topics: ["지중해식", "심혈관", "콜레스테롤", "다이어트", "예방"],
    quality_score: 4,
    status: "collected",
    notes: "Systematic review. 의약학적 disclaimer 필요 — 환자는 의사 상담 우선.",
  },
  {
    source_type: "paper",
    title:
      "Effects of ketogenic and low-carbohydrate diets on the body composition of adults with overweight or obesity: A systematic review and meta-analysis of randomised controlled trials",
    url: "https://pubmed.ncbi.nlm.nih.gov/39854812/",
    doi: "10.1016/j.clnu.2025.01.017",
    pmid: "39854812",
    authors: ["Leung LY", "Tam HL", "Ho JK"],
    outlet: "Clinical Nutrition",
    published_date: "2025-03-01",
    abstract:
      "Systematic review and meta-analysis. 33 RCTs, 2821 individuals with overweight or obesity. Investigated ketogenic diet (KD) and low-carbohydrate diet (LCD) effects on BW, BMI, FM, BFP. Carbohydrate intake ≤100 g/d significantly reduced BW, BMI, BFP (not FM). Subgroup analyses: KD/LCD ≥1 month significantly improved BW, BMI, FM; carbohydrate ≤50 g/d improved all parameters. High statistical heterogeneity. Recommendation: KD/LCD ≥1 month, carbohydrate ≤50 g/d, with stringent medical supervision.",
    key_findings:
      "과체중/비만 성인에서 케토제닉/저탄수화물 식단(탄수 100g/일 이하)이 체중·BMI·체지방률 감소에 효과. 더 엄격하게 50g/일 이하로 1개월 이상 유지 시 체지방량까지 유의하게 감소. 33개 RCT, 2821명. 다만 연구 간 이질성이 높아 개인차 큼 — 의학적 감독 필수. 단기 효과는 분명하나 장기 안전성(신장·간 부담, 영양 결핍, 임신 시 부작용)은 별도 고려.",
    topics: ["저탄수화물", "케토제닉", "다이어트", "체지방", "비만"],
    quality_score: 4,
    status: "collected",
    notes: "Meta-analysis. 의료 disclaimer 강조 — '의학적 감독 하에' 명시 필요. 임신 등 금기 상황 언급 필수.",
  },
  {
    source_type: "paper",
    title:
      "Ultraprocessed or minimally processed diets following healthy dietary guidelines on weight and cardiometabolic health: a randomized, crossover trial",
    url: "https://pubmed.ncbi.nlm.nih.gov/40760353/",
    doi: "10.1038/s41591-025-03842-0",
    pmid: "40760353",
    authors: [
      "Dicken SJ", "Jassil FC", "Brown A", "Kalis M", "Stanley C",
      "Ranson C", "Ruwona T", "Qamar S", "Buck C", "Mallik R",
      "Hamid N", "Bird JM", "Brown A", "Norton B",
      "Gandini Wheeler-Kingshott CAM", "Hamer M", "van Tulleken C",
      "Hall KD", "Fisher A", "Makaronidis J", "Batterham RL",
    ],
    outlet: "Nature Medicine",
    published_date: "2025-10-01",
    abstract:
      "2×2 crossover RCT feeding trial. 55 adults in England (BMI ≥25 to <40, habitual UPF intake ≥50% kcal/day). Two 8-week ad libitum diets following UK Eatwell Guide: minimally processed food (MPF) vs ultraprocessed food (UPF), random order. ITT n=50. Primary outcome: within-participant %WC. MPF: -2.06% (95% CI -2.99 to -1.13). UPF: -1.05% (95% CI -1.98 to -0.13). Difference: -1.01% in favor of MPF (P=0.024, Cohen's d -0.48). Mild GI events common on both. Conclusion: MPF leads to greater weight loss than UPF even when both follow national dietary guidelines.",
    key_findings:
      "동일한 영국 식이 가이드라인을 따르더라도 가공이 적은 식품(MPF)이 초가공식품(UPF)보다 체중 감량 효과가 큼. 55명 8주 교차 시험에서 MPF -2.06%, UPF -1.05% — 차이 약 1%p. 즉 가이드라인 준수 자체보다 식품 '가공도' 가 추가 변수. 두 식단 모두 경증 위장관 부작용 흔함. 한계: 8주 단기, 표본 크기 작음. 그래도 직접 무작위 비교라는 점에서 의의 큼.",
    topics: ["초가공식품", "다이어트", "체중감량", "식이 가이드라인", "가공식품"],
    quality_score: 5,
    status: "collected",
    notes: "Nature Medicine 2025. 직접 RCT 비교. 비판 논평(2026)도 존재 — 균형 있게 인용.",
  },
  {
    source_type: "paper",
    title:
      "Improving sarcopenia in older adults: a systematic review and meta-analysis of randomized controlled trials of whey protein supplementation with or without resistance training",
    url: "https://pubmed.ncbi.nlm.nih.gov/38350303/",
    doi: "10.1016/j.jnha.2024.100184",
    pmid: "38350303",
    authors: [
      "Li ML", "Zhang F", "Luo HY", "Quan ZW", "Wang YF", "Huang LT", "Wang JH",
    ],
    outlet: "Journal of Nutrition, Health & Aging",
    published_date: "2024-04-01",
    abstract:
      "Meta-analysis. 10 RCTs, 1154 older adults with sarcopenia (EWGSOP/AWGS criteria). Whey protein (WP) ± resistance training (RT). WP vs placebo/routine consultation: significant increases in appendicular skeletal muscle mass index (SMD 0.47), appendicular skeletal muscle mass (SMD 0.28), gait speed (SMD 1.13). WP + RT vs control: significant increase in handgrip strength (SMD 0.67). Secondary: WP reduced IL-6, increased IGF-1 and albumin, enhanced ADL scores. No significant effect on BMI/weight/fat mass.",
    key_findings:
      "근감소증을 가진 노인에서 유청 단백질 보충(WP)이 골격근량과 보행속도를 유의하게 개선. 저항운동 병행 시 악력까지 추가 향상. 10개 RCT, 1154명. 체중·BMI·체지방에는 유의한 영향 없음 — '근육은 늘되 살은 안 빼는' 패턴. 다이어트 카테고리에서는 '근손실 방지하면서 감량' 의 핵심 근거. 노인층 또는 저칼로리 다이어트 중인 성인에게 시사점 큼.",
    topics: ["단백질", "근감소증", "노인", "유청단백질", "근력운동", "다이어트"],
    quality_score: 4,
    status: "collected",
    notes: "Meta-analysis 2024. 보충제 권장은 신중하게 — 일반 식품 단백질 우선, 과다 섭취/신장 질환 환자 주의.",
  },
  {
    source_type: "paper",
    title:
      "Intermittent fasting for weight management and metabolic health: An updated comprehensive umbrella review of health outcomes",
    url: "https://pubmed.ncbi.nlm.nih.gov/39618023/",
    doi: "10.1111/dom.16092",
    pmid: "39618023",
    authors: [
      "Hua Z", "Yang S", "Li J", "Sun Y", "Liao Y", "Song S",
      "Cheng S", "Li Z", "Li Z", "Li D", "Guo H", "Yang H",
      "Zheng Y", "Li X",
    ],
    outlet: "Diabetes, Obesity and Metabolism",
    published_date: "2025-02-01",
    abstract:
      "Umbrella review through June 2024. 12 meta-analyses, 122 health outcome associations. High-quality evidence: time-restricted eating significantly associated with weight loss, fat mass reduction, decreased fasting insulin and HbA1c in overweight/obese adults; 5:2 diet linked to reduced LDL-C. Moderate-to-low quality evidence: modified alternate-day fasting improved body weight, lipid profile, BP. High-to-low evidence: IF regimens improved liver health in NAFLD. Conclusion: IF (especially TRE) is promising for weight and metabolic health in overweight/obese adults; further research needed on long-term effects, individualization, adverse events.",
    key_findings:
      "간헐적 단식의 12개 메타분석을 종합한 우산형 리뷰(umbrella review). 시간제한 식이(TRE)가 과체중/비만 성인의 체중·체지방·공복 인슐린·당화혈색소 개선에 가장 강한 근거. 5:2 식이는 LDL 콜레스테롤 감소와 연관. 격일 단식은 중간-낮은 근거지만 체중/지질/혈압 개선 시사. 비알코올성 지방간(NAFLD)에서 간 기능 개선도 관찰. 장기 효과·개인 맞춤·부작용은 추가 연구 필요.",
    topics: ["간헐적 단식", "시간제한 식이", "5:2 식이", "대사증후군", "지방간"],
    quality_score: 4,
    status: "collected",
    notes: "Umbrella review (메타분석의 메타분석) — 전체 그림 그릴 때 인용하기 좋음.",
  },
];

async function run() {
  console.log(`Inserting ${PAPERS.length} papers...`);

  const rows = PAPERS.map((p) => ({ ...p, collected_by: COLLECTOR }));

  // 중복 방지: pmid 가 이미 있으면 skip
  const pmids = rows.map((r) => r.pmid).filter(Boolean);
  const { data: existing } = await sb
    .from("health_sources")
    .select("pmid")
    .in("pmid", pmids);
  const existingPmids = new Set((existing ?? []).map((r) => r.pmid));

  const toInsert = rows.filter((r) => !existingPmids.has(r.pmid));
  const skipped = rows.length - toInsert.length;

  if (toInsert.length === 0) {
    console.log(`All ${rows.length} papers already exist (skipped). Nothing to insert.`);
    return;
  }

  const { data, error } = await sb
    .from("health_sources")
    .insert(toInsert)
    .select("id, title, pmid");

  if (error) {
    console.error("Insert error:", error);
    process.exit(1);
  }

  console.log(`Inserted: ${data?.length ?? 0}, Skipped (already existed): ${skipped}`);
  for (const r of data ?? []) {
    console.log(`  ✓ ${r.pmid}  ${r.title.slice(0, 80)}…`);
  }

  // 감사 로그
  const { error: logErr } = await sb.from("health_admin_actions").insert({
    actor_email: COLLECTOR,
    action: "seed_diet_sources",
    target_type: "health_source",
    payload: {
      inserted: data?.length ?? 0,
      skipped,
      pmids: (data ?? []).map((r) => r.pmid),
    },
  });
  if (logErr) console.warn("Audit log warn:", logErr.message);
}

await run();
