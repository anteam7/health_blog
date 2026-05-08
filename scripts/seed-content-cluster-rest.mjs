// 클러스터 나머지 4편 (#4 NAFLD, #5 부작용, #6 근손실, #7 Pillar) 일괄 시드.
// — 신규 자료: PMID 37534936 (NAFLD 메타), PMID 39320714 (여성 IF 영향)
// — 재사용 자료: 보유 PMID 풀에서 source_ids 연결
// — cluster_roadmap[order=4|5|6|7] 항목 갱신 + content_id 연결
//
// 멱등 — 다시 돌려도 중복 INSERT 없음. status 는 update 에서 제외(published 보호).
//
// 사용법:
//   node scripts/seed-content-cluster-rest.mjs

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
  { auth: { persistSession: false } },
);

const ACTOR = "anseunghyok@gmail.com";
const TOPIC_SLUG = "intermittent-fasting";

// ─────────────────────────────────────────────
// 신규 자료 2건 (PubMed fetch 검증 완료)
// ─────────────────────────────────────────────
const NEW_PAPERS = [
  {
    source_type: "paper",
    pmid: "37534936",
    doi: "10.1097/HC9.0000000000000212",
    url: "https://pubmed.ncbi.nlm.nih.gov/37534936/",
    title:
      "Intermittent fasting improves hepatic end points in nonalcoholic fatty liver disease: A systematic review and meta-analysis",
    authors: [
      "Lange M", "Nadkarni D", "Martin L", "Newberry C", "Kumar S", "Kushner T",
    ],
    outlet: "Hepatology Communications",
    published_date: "2023-08-03",
    key_findings:
      "비알코올성 지방간(NAFLD) 환자 대상 간헐적 단식의 효과를 통합 분석한 systematic review + meta-analysis. 14개 연구를 정리하고 그중 10개(840명, 남성 44.6%)를 메타분석. 비교한 단식 형태: 5:2, 격일 단식, 시간제한식, 라마단 단식. 추적 기간 4–52주. 결과: 체중·BMI·허리/엉덩이 비율 감소, ALT·AST 감소, 간 지방 감소 모두 통계적으로 유의(p<0.05). 근거 등급: 제한적이지만 중등도~높은 수준.",
    topics: ["간헐적 단식", "지방간", "NAFLD", "ALT", "메타분석"],
    quality_score: 5,
    status: "used",
    notes: "글 #4 — NAFLD 메인 자료",
  },
  {
    source_type: "paper",
    pmid: "39320714",
    doi: "10.1007/s13668-024-00569-1",
    url: "https://pubmed.ncbi.nlm.nih.gov/39320714/",
    title:
      "Effects of Intermittent Fasting on Female Reproductive Function: A Review of Animal and Human Studies",
    authors: ["Mao L", "Liu A", "Zhang X"],
    outlet: "Current Nutrition Reports",
    published_date: "2024-12-01",
    key_findings:
      "여성 생식기능에 미치는 간헐적 단식 영향을 동물·인간 연구로 종합한 narrative review. 핵심: ① 건강 정상체중 여성에서 격일 단식·8h TRF 가 생식기능에 부정적 영향 가능. ② 비만/PCOS 여성: 5:2·TRE 가 자유 안드로겐 감소·SHBG 증가·생리 규칙성 개선으로 오히려 도움. ③ 임신·수유 중 라마단 단식은 신생아 출생체중·산모 체중 우려. 권고: 건강 정상체중 여성은 ADF/짧은 식사창 신중, 비만/PCOS 는 가능, 임신부는 권장 안 됨.",
    topics: ["간헐적 단식", "여성 호르몬", "생식기능", "PCOS"],
    quality_score: 4,
    status: "used",
    notes: "글 #5 — 여성 단식 부작용 메인 자료",
  },
];

// ─────────────────────────────────────────────
// 글 정의 (4편)
// ─────────────────────────────────────────────
const POSTS = [
  {
    order: 4,
    slug: "intermittent-fasting-fatty-liver",
    title: "지방간(NAFLD) 에 간헐적 단식 효과 — 14건 연구·840명 메타분석",
    excerpt:
      "비알코올성 지방간 환자에게 간헐적 단식이 ALT·AST·간 지방을 분명히 낮췄다는 2023년 메타분석을 정리하고, 누가 시작 전 의사 상담이 필요한지 안내합니다.",
    tags: ["간헐적 단식", "지방간", "NAFLD", "다이어트"],
    target_keyword: "간헐적 단식 지방간",
    primary_pmid: "37534936",
    new_pmids: ["37534936"],
    reused_pmids: ["40533200", "39618023"],
    notes:
      "Lange 2023 메타 메인. NAFLD 환자가 약 복용 시 의사 상담 필수 강조.",
  },
  {
    order: 5,
    slug: "intermittent-fasting-side-effects",
    title:
      "간헐적 단식 부작용 — 두통·생리불순·폭식 반등, 어떻게 줄일까",
    excerpt:
      "두통·어지럼·생리불순·자유일 폭식 등 흔한 부작용을 종류·심각도·예방법으로 정리. 특히 여성 호르몬 영향에 대한 2024년 리뷰까지.",
    tags: ["간헐적 단식", "부작용", "다이어트 부작용", "16:8"],
    target_keyword: "간헐적 단식 부작용",
    primary_pmid: "39320714",
    new_pmids: ["39320714"],
    reused_pmids: ["39618023"],
    notes:
      "Mao 2024 여성 생식기능 review 메인 + IF umbrella 재사용. 여성·약 복용자 강조.",
  },
  {
    order: 6,
    slug: "intermittent-fasting-muscle-loss",
    title:
      "간헐적 단식하면서 근육 안 빠지려면 — 단백질·저항운동 가이드",
    excerpt:
      "단식 중 근손실은 단백질 1.2–1.6g/kg + 주 2–3회 저항운동으로 막을 수 있어요. 단식 형태별 근손실 위험 + 16:8 식사창 단백질 채우기 예시까지.",
    tags: ["간헐적 단식", "근손실", "단백질", "저항운동"],
    target_keyword: "간헐적 단식 근손실",
    primary_pmid: "38350303",
    new_pmids: [],
    reused_pmids: ["38350303", "35660501"],
    notes:
      "보유 자료(whey + sarcopenia, Chaudhary 자가포식 마커) 재활용. 신규 자료 없음.",
  },
  {
    order: 7,
    slug: "intermittent-fasting-complete-guide",
    title:
      "간헐적 단식 완전 가이드 — 효과·종류·누구에게 맞나 (Pillar)",
    excerpt:
      "간헐적 단식의 효과·종류·시작법·부작용을 클러스터 7편 데이터로 종합한 Pillar 글. 다른 글로의 internal link 풍성.",
    tags: ["간헐적 단식", "다이어트 가이드", "16:8", "5:2"],
    target_keyword: "간헐적 단식",
    primary_pmid: "40533200",
    new_pmids: [],
    reused_pmids: [
      "40533200", "39618023", "28459931", "31471173",
      "40345145", "39542136", "35660501", "40481380",
      "37534936", "39320714",
    ],
    notes:
      "Pillar 글. 모든 클러스터 자료 종합 + internal link 강화. published 승격은 다른 6편 검증 후 권장.",
  },
];

// ─────────────────────────────────────────────
async function run() {
  console.log("[1/6] fetch topic", TOPIC_SLUG);
  const { data: topic, error: topicErr } = await sb
    .from("health_topics")
    .select("id, cluster_roadmap, metadata")
    .eq("slug", TOPIC_SLUG)
    .single();
  if (topicErr) throw topicErr;
  console.log("    topic id:", topic.id);

  // ─────────────────────────────────────────────
  console.log("[2/6] upsert new papers");
  const newPmids = NEW_PAPERS.map((p) => p.pmid);
  const { data: existingNew } = await sb
    .from("health_sources")
    .select("id, pmid")
    .in("pmid", newPmids);
  const existingNewMap = new Map(
    (existingNew ?? []).map((r) => [r.pmid, r.id]),
  );

  const papersToInsert = NEW_PAPERS.filter(
    (p) => !existingNewMap.has(p.pmid),
  ).map((p) => ({ ...p, topic_id: topic.id, collected_by: ACTOR }));

  if (papersToInsert.length > 0) {
    const { data, error } = await sb
      .from("health_sources")
      .insert(papersToInsert)
      .select("id, pmid, title");
    if (error) throw error;
    for (const r of data ?? []) {
      console.log(`    + ${r.pmid}  ${r.title.slice(0, 60)}…`);
      existingNewMap.set(r.pmid, r.id);
    }
  }
  if (existingNewMap.size > 0) {
    await sb
      .from("health_sources")
      .update({ topic_id: topic.id, status: "used" })
      .in("pmid", [...existingNewMap.keys()]);
  }

  // ─────────────────────────────────────────────
  console.log("[3/6] fetch reused papers (이미 DB에 있는 PMID)");
  const allReusedPmids = [
    ...new Set(POSTS.flatMap((p) => p.reused_pmids)),
  ];
  const { data: reusedRows, error: reusedErr } = await sb
    .from("health_sources")
    .select("id, pmid")
    .in("pmid", allReusedPmids);
  if (reusedErr) throw reusedErr;
  const reusedIdMap = new Map((reusedRows ?? []).map((r) => [r.pmid, r.id]));
  for (const pmid of allReusedPmids) {
    if (!reusedIdMap.has(pmid)) {
      console.warn(`    ⚠️ PMID ${pmid} 가 DB 에 없음 — 건너뜀`);
    }
  }
  await sb
    .from("health_sources")
    .update({ status: "used" })
    .in("pmid", [...reusedIdMap.keys()]);

  // helper: pmid 배열 → source_ids 배열
  const idsFromPmids = (pmids) =>
    pmids
      .map((pmid) => existingNewMap.get(pmid) ?? reusedIdMap.get(pmid))
      .filter(Boolean);

  // ─────────────────────────────────────────────
  console.log("[4/6] upsert 4 contents");
  const updatedRoadmap = [...(topic.cluster_roadmap ?? [])];

  for (const post of POSTS) {
    const bodyMd = readFileSync(
      new URL(`../content/${post.slug}.md`, import.meta.url),
      "utf8",
    );
    const sourceIds = idsFromPmids([
      ...post.new_pmids,
      ...post.reused_pmids,
    ]);

    const { data: existing } = await sb
      .from("health_contents")
      .select("id")
      .eq("slug", post.slug)
      .maybeSingle();

    let contentId;
    if (existing) {
      // ⚠️ status 는 update 에서 제외
      const { data, error } = await sb
        .from("health_contents")
        .update({
          title: post.title,
          excerpt: post.excerpt,
          body_md: bodyMd,
          tags: post.tags,
          source_ids: sourceIds,
          topic_id: topic.id,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", post.slug)
        .select("id")
        .single();
      if (error) throw error;
      contentId = data.id;
      console.log(`    = #${post.order}  ${post.slug}  (updated ${contentId})`);
    } else {
      const { data, error } = await sb
        .from("health_contents")
        .insert({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          body_md: bodyMd,
          tags: post.tags,
          status: "draft",
          source_ids: sourceIds,
          topic_id: topic.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      contentId = data.id;
      console.log(`    + #${post.order}  ${post.slug}  (inserted ${contentId})`);
    }

    // roadmap 갱신
    const idx = updatedRoadmap.findIndex((r) => r.order === post.order);
    const item = {
      order: post.order,
      slug: post.slug,
      title: post.title,
      target_keyword: post.target_keyword,
      primary_source_pmid: post.primary_pmid,
      status: "draft",
      content_id: contentId,
      notes: post.notes,
    };
    if (idx >= 0) updatedRoadmap[idx] = { ...updatedRoadmap[idx], ...item };
    else updatedRoadmap.push(item);
  }

  // ─────────────────────────────────────────────
  console.log("[5/6] update cluster_roadmap");
  updatedRoadmap.sort((a, b) => a.order - b.order);
  await sb
    .from("health_topics")
    .update({
      cluster_roadmap: updatedRoadmap,
      metadata: {
        ...(topic.metadata ?? {}),
        cluster_size: updatedRoadmap.length,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", topic.id);

  // ─────────────────────────────────────────────
  console.log("[6/6] audit log");
  await sb.from("health_admin_actions").insert({
    actor_email: ACTOR,
    action: "seed_content_cluster_rest",
    target_type: "health_topic",
    target_id: topic.id,
    payload: {
      posts: POSTS.map((p) => ({ order: p.order, slug: p.slug })),
      papers_new: papersToInsert.length,
      papers_reused: reusedIdMap.size,
    },
  });

  console.log(`\n✅ done — ${POSTS.length}편 시드 완료`);
  console.log(`   cluster_size: ${updatedRoadmap.length}`);
}

await run().catch((e) => {
  console.error("\n❌ failed:", e.message ?? e);
  if (e.details) console.error("   details:", e.details);
  if (e.hint) console.error("   hint:", e.hint);
  process.exit(1);
});
