// D 글 ("16시간 굶으면 세포가 청소된다? — 자가포식 자기점검")
// — health_sources(논문 4편) + health_contents 시드
// — intermittent-fasting 토픽의 cluster_roadmap 8번 항목으로 등록
//
// 멱등: 다시 돌려도 중복 INSERT 없음 (PMID/slug 체크).
//
// 사용법:
//   node scripts/seed-d-autophagy-content.mjs

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
const POST_SLUG = "intermittent-fasting-autophagy-truth";

// ─────────────────────────────────────────────
// 자가포식 핵심 논문 4편 (PubMed 직접 fetch 검증 완료)
// 스키마: authors TEXT[], outlet (저널명), published_date DATE
// ─────────────────────────────────────────────
const PAPERS = [
  {
    source_type: "paper",
    pmid: "40345145",
    doi: "10.1113/JP287938",
    url: "https://pubmed.ncbi.nlm.nih.gov/40345145/",
    title:
      "Intermittent time-restricted eating may increase autophagic flux in humans: an exploratory analysis",
    authors: [
      "Bensalem J", "Teong XT", "Hattersley KJ", "Hein LK", "Fourrier C",
      "Dang LVP", "Singh S", "Liu K", "Wittert GA", "Hutchison AT",
      "Heilbronn LK", "Sargeant TJ",
    ],
    outlet: "Journal of Physiology",
    published_date: "2025-05-01",
    key_findings:
      "비만 성인 121명을 ① 표준케어, ② 칼로리 제한, ③ 시간제한식+간헐적 단식의 세 그룹으로 6개월 추적한 무작위 대조시험. 혈액 PBMC의 LC3B-II 흐름으로 자가포식을 측정한 결과 ③ 그룹은 6개월 시점 표준케어 대비 유의한 증가(P=0.04, 사후·탐색적 분석). 사람에서 자가포식 흐름을 잰 첫 RCT라는 의의가 있으나 후속 검증 필요.",
    topics: ["간헐적 단식", "자가포식", "16:8", "건강수명"],
    quality_score: 4,
    status: "used",
    notes: "글 D — 인간 RCT 핵심 인용",
  },
  {
    source_type: "paper",
    pmid: "39542136",
    doi: "10.1016/j.clnesp.2024.11.002",
    url: "https://pubmed.ncbi.nlm.nih.gov/39542136/",
    title:
      "Dawn-to-dusk intermittent fasting is associated with overexpression of autophagy genes: A prospective study on overweight and obese cohort",
    authors: [
      "Bou Malhab LJ", "Madkour MI", "Abdelrahim DN", "Eldohaji L",
      "Saber-Ayad M", "Eid N", "Abdel-Rahman WM", "Faris ME",
    ],
    outlet: "Clinical Nutrition ESPEN",
    published_date: "2025-02-01",
    key_findings:
      "과체중·비만 51명을 4주간 라마단 단식(약 12–16시간)에 참여시킨 단일군 전향 연구(정상 BMI 6명을 reference). LAMP2 4.2배, LC3B 1.9배, ATG5 1.4배 발현 증가. 체중·BMI·IL-6·TNF-α 감소, HDL·IL-10·CD163 증가. 정식 RCT는 아니나 라마단 인구 대상 자가포식 유전자 발현 변화를 보여줌.",
    topics: ["간헐적 단식", "자가포식", "라마단", "유전자 발현"],
    quality_score: 3,
    status: "used",
    notes: "글 D — 라마단 단식 인간 데이터",
  },
  {
    source_type: "paper",
    pmid: "35660501",
    doi: "10.1016/j.nut.2022.111662",
    url: "https://pubmed.ncbi.nlm.nih.gov/35660501/",
    title:
      "Intermittent fasting activates markers of autophagy in mouse liver, but not muscle from mouse or humans",
    authors: [
      "Chaudhary R", "Liu B", "Bensalem J", "Sargeant TJ", "Page AJ",
      "Wittert GA", "Hutchison AT", "Heilbronn LK",
    ],
    outlet: "Nutrition",
    published_date: "2022-09-01",
    key_findings:
      "마우스(C57BL/6J) + 인간 여성 50명 RCT. 마우스 간에서는 IF로 자가포식 마커(LC3, Beclin1, LAMP1) 증가했으나 마우스 근육에서는 변화 없음. 인간 vastus lateralis 근육에서는 12시간 야간 공복 후 BECLIN1·SQSTM1·LAMP2 mRNA 감소, 24시간 단식 후 SQSTM1 증가로 시점에 따라 방향 엇갈림. 자가포식 효과의 조직별·시점별 차이를 보여준 핵심 자료.",
    topics: ["간헐적 단식", "자가포식", "근손실", "조직별 차이"],
    quality_score: 4,
    status: "used",
    notes: "글 D — '16시간 = 세포 청소' 단정 카피의 반박 핵심 자료",
  },
  {
    source_type: "paper",
    pmid: "40481380",
    doi: "10.1007/s13668-025-00666-9",
    url: "https://pubmed.ncbi.nlm.nih.gov/40481380/",
    title:
      "A Narrative Review about Metabolic Pathways, Molecular Mechanisms and Clinical Implications of Intermittent Fasting as Autophagy Promotor",
    authors: [
      "Vergara Nieto AA", "Halabi Diaz A", "Hernandez M", "Sagredo D",
    ],
    outlet: "Current Nutrition Reports",
    published_date: "2025-06-01",
    key_findings:
      "간헐적 단식이 AMPK-mTOR 축, sirtuin, β-hydroxybutyrate 신호를 통해 자가포식을 induce하는 분자 메커니즘을 정리한 종설. 전임상 및 임상 데이터를 종합. 다만 임상 프로토콜 표준화와 자가포식 측정 바이오마커 합의가 미해결 과제임을 명시.",
    topics: ["간헐적 단식", "자가포식", "AMPK", "mTOR", "메커니즘"],
    quality_score: 3,
    status: "used",
    notes: "글 D — 메커니즘 종설 + 한계 인용",
  },
];

// 동아일보 (글 #1에서 이미 시드됨 — URL 조회로 id 가져옴)
const EXISTING_NEWS_URL = "https://v.daum.net/v/20260127143428734";

const POST = {
  slug: POST_SLUG,
  title: "\"16시간 굶으면 세포가 청소된다\"는 말, 어디까지 진짜일까?",
  excerpt:
    "16시간 단식하면 세포가 자가포식으로 청소된다는 마케팅, 2025년 RCT 121명 6개월 결과로 검증해봤습니다. 매직 넘버 아닙니다.",
  body_md: readFileSync(
    new URL(`../content/${POST_SLUG}.md`, import.meta.url),
    "utf8",
  ),
  tags: ["간헐적 단식", "자가포식", "16:8", "단식 효과"],
  status: "draft",
  cover_image_url: null,
};

const NEW_ROADMAP_ITEM = {
  order: 8,
  slug: POST_SLUG,
  title: POST.title,
  target_keyword: "16시간 단식 효과",
  primary_source_pmid: "40345145",
  status: "draft",
  notes:
    "자가포식 마케팅 검증. blog-post-reviewer 1차 검토 통과 권역(심각 0 + 경미 ~4). 다음 글 톤·구조 베이스라인.",
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
  console.log("[2/5] upsert autophagy papers");
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

  const allPaperIds = [
    ...existingPmidMap.values(),
    ...insertedPapers.map((r) => r.id),
  ];

  // ─────────────────────────────────────────────
  console.log("[3/5] fetch existing 동아일보 source");
  const { data: news, error: newsErr } = await sb
    .from("health_sources")
    .select("id")
    .eq("url", EXISTING_NEWS_URL)
    .maybeSingle();
  if (newsErr) throw newsErr;
  if (!news) throw new Error(`동아일보 source not found: ${EXISTING_NEWS_URL}`);
  console.log("    news id:", news.id);

  const sourceIds = [...allPaperIds, news.id];

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
      // ⚠️ status 는 update 에서 제외 — published 글이 draft 로 되돌아가는 사고 방지
      .update({
        title: POST.title,
        excerpt: POST.excerpt,
        body_md: POST.body_md,
        tags: POST.tags,
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
  console.log("[5/5] cluster_roadmap 8번 항목 추가 + audit log");
  const currentRoadmap = topic.cluster_roadmap ?? [];
  const filtered = currentRoadmap.filter(
    (r) => r.order !== 8 && r.slug !== POST_SLUG,
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
    action: "seed_d_autophagy_content",
    target_type: "health_contents",
    target_id: postId,
    payload: {
      topic_slug: TOPIC_SLUG,
      content_slug: POST.slug,
      content_id: postId,
      papers_inserted: insertedPapers.length,
      papers_existed: existingPmidMap.size,
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
    `(논문 ${allPaperIds.length} + 뉴스 1)`,
  );
  console.log("   cluster_size: ", newRoadmap.length);
}

await run().catch((e) => {
  console.error("\n❌ failed:", e.message ?? e);
  if (e.details) console.error("   details:", e.details);
  if (e.hint) console.error("   hint:", e.hint);
  process.exit(1);
});
