// 글 #3 ("격일 단식 심층 — Trepanowski 1년 RCT + Stekovic 노화 마커")
// — health_sources(논문 2건 신규: Trepanowski 2017, Stekovic 2019) + health_contents 시드
// — intermittent-fasting 토픽의 cluster_roadmap order=3 항목으로 등록
//
// 멱등: 다시 돌려도 중복 INSERT 없음 (PMID/slug 체크).
//
// 사용법:
//   node scripts/seed-content-3-adf-deep-dive.mjs

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
const TOPIC_SLUG = "intermittent-fasting";
const POST_SLUG = "intermittent-fasting-adf-deep-dive";

// ─────────────────────────────────────────────
// ADF 핵심 RCT 2건 (PubMed 직접 fetch 검증 완료)
// ─────────────────────────────────────────────
const PAPERS = [
  {
    source_type: "paper",
    pmid: "28459931",
    doi: "10.1001/jamainternmed.2017.0936",
    url: "https://pubmed.ncbi.nlm.nih.gov/28459931/",
    title:
      "Effect of Alternate-Day Fasting on Weight Loss, Weight Maintenance, and Cardioprotection Among Metabolically Healthy Obese Adults: A Randomized Clinical Trial",
    authors: [
      "Trepanowski JF", "Kroeger CM", "Barnosky A", "Klempel MC", "Bhutani S",
      "Hoddy KK", "Gabel K", "Freels S", "Rigdon J", "Rood J", "Ravussin E",
      "Varady KA",
    ],
    outlet: "JAMA Internal Medicine",
    published_date: "2017-07-01",
    key_findings:
      "비만 성인 100명을 1년간 격일 단식 vs 일반 칼로리 제한 vs 대조군의 3그룹으로 추적한 RCT. 6개월·12개월 시점 체중 감량은 격일 단식과 일반 칼로리 제한 사이에 유의차 없음 (6m: −6.8% vs −6.8%, 12m: −6.0% vs −5.3%). 중도 포기율은 격일 단식 38% / 일반 다이어트 29% / 대조군 26%로 격일 단식이 가장 높음. 격일 단식 그룹은 12개월 시점 LDL 약 11.5mg/dL 증가(통계적 유의). 결론: 격일 단식이 일반 칼로리 제한 대비 우월하지 않음.",
    topics: ["간헐적 단식", "격일 단식", "ADF", "1년 RCT"],
    quality_score: 5,
    status: "used",
    notes: "글 #3 — 격일 단식 1년 결과의 핵심 반전 자료",
  },
  {
    source_type: "paper",
    pmid: "31471173",
    doi: "10.1016/j.cmet.2019.07.016",
    url: "https://pubmed.ncbi.nlm.nih.gov/31471173/",
    title:
      "Alternate Day Fasting Improves Physiological and Molecular Markers of Aging in Healthy, Non-obese Humans",
    authors: [
      "Stekovic S", "Hofer SJ", "Tripolt N", "Aon MA", "Royer P", "Pein L",
      "Stadler JT", "Pendl T", "Prietl B", "Url J", "Schroeder S", "Tadic J",
      "Eisenberg T", "Magnes C", "Stumpe M", "Zuegner E", "Bordag N",
      "Riedl R", "Schmidt A", "Kolesnik E", "Verheyen N", "Springer A",
      "Madl T", "Sinner F", "de Cabo R", "Kroemer G", "Obermayer-Pietsch B",
      "Dengjel J", "Sourij H", "Pieber TR", "Madeo F",
    ],
    outlet: "Cell Metabolism",
    published_date: "2019-09-03",
    key_findings:
      "건강한 비-비만 성인을 4주간 엄격한 격일 단식에 참여시킨 RCT. 평균 약 37% 칼로리 감소 자연 발생. LDL·sICAM-1·T3 감소, β-hydroxybutyrate(케톤체) 증가. 6개월 이상 추적에서 부작용 없음. 노화 관련 마커(혈관 염증·콜레스테롤) 개선을 보였으나 단기 연구 한계.",
    topics: ["간헐적 단식", "격일 단식", "ADF", "노화 마커", "케톤"],
    quality_score: 4,
    status: "used",
    notes: "글 #3 — ADF 노화/대사 마커 효과 자료",
  },
];

// 기존 자료 (#1·#2 시드에서 이미 DB)
const EXISTING_PMIDS = ["40533200", "39618023"]; // BMJ NMA + IF umbrella
const EXISTING_NEWS_URLS = []; // 이번 글은 한국 뉴스 인용 없음

const POST = {
  slug: POST_SLUG,
  title: "격일 단식(ADF) 효과·부작용 — 1년 RCT 100명이 알려준 진짜 결과",
  excerpt:
    "격일 단식이 BMJ 분석에선 가장 잘 빠졌지만, 1년 RCT(JAMA 2017)에선 일반 다이어트와 차이가 사라졌어요. 중도 포기율 38%가 가장 큰 변수입니다.",
  body_md: readFileSync(
    new URL(`../content/${POST_SLUG}.md`, import.meta.url),
    "utf8",
  ),
  tags: ["격일 단식", "ADF", "간헐적 단식", "다이어트 부작용"],
  status: "draft",
  cover_image_url: null,
};

const NEW_ROADMAP_ITEM = {
  order: 3,
  slug: POST_SLUG,
  title: POST.title,
  target_keyword: "격일 단식",
  primary_source_pmid: "28459931",
  status: "draft",
  notes:
    "Trepanowski 2017 1년 RCT (38% dropout) 메인 + Stekovic 2019 4주 노화 마커 보조 + BMJ 2025 NMA 맥락. 신톤(다이어트 일반 독자) 적용.",
};

// ─────────────────────────────────────────────
async function run() {
  console.log("[1/5] fetch topic", TOPIC_SLUG);
  const { data: topic, error: topicErr } = await sb
    .from("health_topics")
    .select("id, cluster_roadmap, metadata")
    .eq("slug", TOPIC_SLUG)
    .single();
  if (topicErr) throw topicErr;
  console.log("    topic id:", topic.id);

  // ─────────────────────────────────────────────
  console.log("[2/5] upsert ADF papers");
  const pmids = PAPERS.map((p) => p.pmid);
  const { data: existingPapers } = await sb
    .from("health_sources")
    .select("id, pmid")
    .in("pmid", pmids);
  const existingPmidMap = new Map((existingPapers ?? []).map((r) => [r.pmid, r.id]));

  const papersToInsert = PAPERS.filter((p) => !existingPmidMap.has(p.pmid)).map(
    (p) => ({ ...p, topic_id: topic.id, collected_by: ACTOR }),
  );

  let insertedPapers = [];
  if (papersToInsert.length > 0) {
    const { data, error } = await sb
      .from("health_sources")
      .insert(papersToInsert)
      .select("id, pmid, title");
    if (error) throw error;
    insertedPapers = data ?? [];
    for (const r of insertedPapers) {
      console.log(`    + ${r.pmid}  ${r.title.slice(0, 60)}…`);
    }
  }
  if (existingPmidMap.size > 0) {
    await sb
      .from("health_sources")
      .update({ topic_id: topic.id, status: "used" })
      .in("pmid", [...existingPmidMap.keys()]);
    for (const pmid of existingPmidMap.keys()) {
      console.log(`    = ${pmid} (existed, updated)`);
    }
  }

  const newPaperIds = [
    ...existingPmidMap.values(),
    ...insertedPapers.map((r) => r.id),
  ];

  // ─────────────────────────────────────────────
  console.log("[3/5] fetch existing reused papers (BMJ NMA + IF umbrella)");
  const { data: reused } = await sb
    .from("health_sources")
    .select("id, pmid")
    .in("pmid", EXISTING_PMIDS);
  const reusedIds = (reused ?? []).map((r) => r.id);
  for (const r of reused ?? []) {
    console.log(`    = ${r.pmid} (reused)`);
  }
  await sb
    .from("health_sources")
    .update({ status: "used" })
    .in("pmid", EXISTING_PMIDS);

  const sourceIds = [...newPaperIds, ...reusedIds];

  // ─────────────────────────────────────────────
  console.log("[4/5] upsert content", POST.slug);
  const { data: existingPost } = await sb
    .from("health_contents")
    .select("id")
    .eq("slug", POST.slug)
    .maybeSingle();

  let postId;
  if (existingPost) {
    const { data, error } = await sb
      .from("health_contents")
      .update({
        title: POST.title,
        excerpt: POST.excerpt,
        body_md: POST.body_md,
        tags: POST.tags,
        status: POST.status,
        cover_image_url: POST.cover_image_url,
        source_ids: sourceIds,
        topic_id: topic.id,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", POST.slug)
      .select("id")
      .single();
    if (error) throw error;
    postId = data.id;
    console.log("    updated:", postId);
  } else {
    const { data, error } = await sb
      .from("health_contents")
      .insert({
        slug: POST.slug,
        title: POST.title,
        excerpt: POST.excerpt,
        body_md: POST.body_md,
        tags: POST.tags,
        status: POST.status,
        cover_image_url: POST.cover_image_url,
        source_ids: sourceIds,
        topic_id: topic.id,
      })
      .select("id")
      .single();
    if (error) throw error;
    postId = data.id;
    console.log("    inserted:", postId);
  }

  // ─────────────────────────────────────────────
  console.log("[5/5] cluster_roadmap order=3 항목 갱신 + audit log");
  const currentRoadmap = topic.cluster_roadmap ?? [];
  const filtered = currentRoadmap.filter(
    (r) => r.order !== 3 && r.slug !== POST_SLUG,
  );
  const newRoadmap = [
    ...filtered,
    { ...NEW_ROADMAP_ITEM, content_id: postId },
  ].sort((a, b) => a.order - b.order);

  const newMetadata = {
    ...(topic.metadata ?? {}),
    cluster_size: newRoadmap.length,
  };

  await sb
    .from("health_topics")
    .update({ cluster_roadmap: newRoadmap, metadata: newMetadata })
    .eq("id", topic.id);

  await sb.from("health_admin_actions").insert({
    actor_email: ACTOR,
    action: "seed_content_3_adf_deep_dive",
    target_type: "health_contents",
    target_id: postId,
    payload: {
      topic_slug: TOPIC_SLUG,
      content_slug: POST.slug,
      content_id: postId,
      papers_inserted: insertedPapers.length,
      papers_existed: existingPmidMap.size,
      papers_reused: reusedIds.length,
      source_ids: sourceIds,
      cluster_size_after: newRoadmap.length,
    },
  });

  console.log("\n✅ done");
  console.log("   topic:        ", topic.id, TOPIC_SLUG);
  console.log("   post:         ", postId, POST.slug, "(", POST.status, ")");
  console.log(
    "   sources used: ",
    sourceIds.length,
    `(신규 ${newPaperIds.length} + 재사용 ${reusedIds.length})`,
  );
  console.log("   cluster_size: ", newRoadmap.length);
}

await run().catch((e) => {
  console.error("\n❌ failed:", e.message ?? e);
  if (e.details) console.error("   details:", e.details);
  if (e.hint) console.error("   hint:", e.hint);
  process.exit(1);
});
