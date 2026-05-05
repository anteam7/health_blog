// "간헐적 단식" 토픽 + 첫 클러스터 글 #1 (16:8 vs 칼로리 제한) 시드.
// 4계층 콘텐츠 파이프라인 MVP-1.
//
// 동작:
//   1) health_topics 에 'intermittent-fasting' upsert
//   2) 보유 논문 3건(BMJ/umbrella/단백질) 의 topic_id 연결
//   3) 한국 뉴스 3건을 health_sources(news) 에 upsert + topic 연결
//   4) content/intermittent-fasting-16-8-vs-calorie-restriction.md 읽어서
//      health_contents 에 status='draft' 로 insert (이미 있으면 update)
//      source_ids 에 BMJ + 뉴스 3건 연결, topic_id 연결
//   5) topic.cluster_roadmap 에 글 #1 status='draft' + content_id 기록
//   6) health_admin_actions 감사 로그
//
// 멱등: 다시 돌려도 중복 생성하지 않음 (slug/url 중복 체크).
//
// 사용법:
//   node scripts/seed-topic-and-content.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// .env.local 자동 로드 (seed-diet-sources.mjs 와 같은 패턴)
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

// ─────────────────────────────────────────────
// 토픽 정의
// ─────────────────────────────────────────────
const TOPIC = {
  slug: "intermittent-fasting",
  title: "간헐적 단식",
  description:
    "간헐적 단식(Intermittent Fasting, IF)은 정해진 시간 동안만 식사하는 식이 패턴이다. 16:8(시간제한 식이, TRE), 5:2, 격일 단식(ADF) 등이 대표적. 다이어트와 대사 건강 관점에서 검증된 효과·한계·부작용 데이터를 바탕으로 한국 독자에게 균형 있는 가이드를 제공한다.",
  keywords: [
    "간헐적 단식",
    "16:8",
    "16:8 다이어트",
    "5:2",
    "5:2 다이어트",
    "격일 단식",
    "시간제한 식이",
    "TRE",
    "ADF",
    "intermittent fasting",
  ],
  status: "in_progress",
  priority: 5,
  cluster_roadmap: [
    {
      order: 1,
      slug: "intermittent-fasting-16-8-vs-calorie-restriction",
      title: "16:8 정말 효과 있나? — 칼로리 제한과 같다는 BMJ 2025 메타분석",
      target_keyword: "16:8 효과",
      primary_source_pmid: "40533200",
      status: "draft", // 이번 사이클에 작성됨
      notes: "검색량 큰 입구 글, 약물·질환자 X 로 디스클레임 부담 낮음",
    },
    {
      order: 2,
      slug: "intermittent-fasting-types-comparison",
      title: "간헐적 단식 5종 비교 — ADF/5:2/TRE/WDF/CER 어느 게 더 빠질까",
      target_keyword: "간헐적 단식 종류",
      primary_source_pmid: "40533200",
      status: "planned",
      notes: "BMJ network meta 그대로 시각화 + 비교표",
    },
    {
      order: 3,
      slug: "alternate-day-fasting-pros-cons",
      title: "격일 단식(ADF) — 유일하게 칼로리 제한보다 더 빠진 방법",
      target_keyword: "격일 단식 효과",
      primary_source_pmid: "40533200",
      status: "planned",
      notes: "극단성 디스클레임 필요. 부작용 강조.",
    },
    {
      order: 4,
      slug: "intermittent-fasting-fatty-liver",
      title: "지방간(NAFLD)에 간헐적 단식이 효과 있다는 게 사실?",
      target_keyword: "지방간 다이어트",
      primary_source_pmid: "39618023",
      status: "planned",
      notes: "환자 대상 — 의사 상담 강조 필수",
    },
    {
      order: 5,
      slug: "intermittent-fasting-side-effects",
      title: "간헐적 단식 부작용 — 두통·생리불순·근손실 어떻게 줄일까",
      target_keyword: "간헐적 단식 부작용",
      primary_source_pmid: "39618023",
      status: "planned",
      notes: "umbrella review 의 adverse events + 단백질 paper",
    },
    {
      order: 6,
      slug: "intermittent-fasting-muscle-loss",
      title: "간헐적 단식하면서 근육 안 빠지려면 — 단백질·운동 가이드",
      target_keyword: "간헐적 단식 근손실",
      primary_source_pmid: "38350303",
      status: "planned",
      notes: "단백질 paper(노인 sarcopenia) + IF paper 엮기",
    },
    {
      order: 7,
      slug: "intermittent-fasting-complete-guide",
      title: "간헐적 단식 완전 가이드 — 효과·종류·누구에게 맞나",
      target_keyword: "간헐적 단식",
      primary_source_pmid: "40533200",
      status: "planned",
      notes: "Pillar 글 — 마지막에 작성, 1~6편 내부 링크",
    },
  ],
  metadata: {
    cluster_size: 7,
    pillar_post_order: 7,
    target_search_volume: "high",
    competition: "medium",
    notes: "콘텐츠 파이프라인 MVP-1 의 첫 토픽 — 클러스터 검증용",
  },
};

// 이 토픽에 연결할 기존 논문 PMID
const EXISTING_PAPER_PMIDS = ["40533200", "39618023", "38350303"];

// 한국 뉴스 3건 (도입부 인용)
const NEWS = [
  {
    source_type: "news",
    title:
      "간헐적 단식, 정말 효과 있을까? 과학의 '냉정한 결론'[건강팩트체크]",
    url: "https://v.daum.net/v/20260127143428734",
    outlet: "동아일보",
    published_date: "2026-01-27",
    key_findings:
      "동물 실험에서 보였던 간헐적 단식의 효과가 사람에게는 제한적이며, 다른 칼로리 제한 식단 대비 특별한 우위가 없다는 점을 정리한 팩트체크 보도. BMJ 2025 메타분석과 결을 같이함.",
    topics: ["간헐적 단식", "16:8", "다이어트", "팩트체크"],
    quality_score: 4,
    status: "used",
    notes: "블로그 글 #1 도입부에 인용",
  },
  {
    source_type: "news",
    title: "간헐적 단식, 체중 감량에 '특별한 이점' 없다?",
    url: "https://kormedi.com/2791380/",
    outlet: "코메디닷컴",
    published_date: "2026-02-21",
    key_findings:
      "Cochrane 리뷰 22개 임상연구(1,995명) 분석 결과 12개월간 약 3% 체중 감소에 그쳐 임상적 유의(5%) 미달. 칼로리 제한 대비 차이 0.33%p 수준. BMJ 메타분석을 한국 독자에게 한 번 더 확인해주는 보강 자료.",
    topics: ["간헐적 단식", "Cochrane", "다이어트", "체중감량"],
    quality_score: 4,
    status: "used",
    notes: "블로그 글 #1 도입부에 인용",
  },
  {
    source_type: "news",
    title:
      "간헐적 단식 했다가 심장마비·뇌졸중…\"사망률 135% 높다\" 연구 결과",
    url: "https://www.seoul.co.kr/news/life/health-news/2025/09/01/20250901500122",
    outlet: "서울신문",
    published_date: "2025-09-01",
    key_findings:
      "하루 8시간 내 식사군이 12–14시간 식사군 대비 심혈관 사망 위험 135% 높다는 미국 추적 연구. 관찰 연구라 인과 단정은 어려우나 장기 시간제한 식이의 위험 가능성을 환기. 균형 시각 제공용.",
    topics: ["간헐적 단식", "16:8", "심혈관", "부작용"],
    quality_score: 3,
    status: "used",
    notes: "블로그 글 #1 도입부에 인용. 관찰 연구 한계 명시 필요.",
  },
];

// 본문 마크다운 (별도 파일)
const BODY_MD = readFileSync(
  new URL("../content/intermittent-fasting-16-8-vs-calorie-restriction.md", import.meta.url),
  "utf8",
);

const POST = {
  slug: "intermittent-fasting-16-8-vs-calorie-restriction",
  title: "16:8 정말 효과 있나? — 칼로리 제한과 같다는 BMJ 2025 메타분석",
  excerpt:
    "16:8 시간제한 식이는 일반 칼로리 제한보다 더 효과적이지 않습니다. BMJ 2025 네트워크 메타분석(99개 RCT, 6,582명)이 내린 결론과, 한국 매체들의 최근 보도 변화를 함께 정리했습니다.",
  body_md: BODY_MD,
  tags: ["간헐적 단식", "16:8", "다이어트", "BMJ 2025", "메타분석"],
  status: "draft", // AdSense 미승인 + 첫 글 검토 필요
  cover_image_url: null,
};

// ─────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────
async function run() {
  console.log("[1/5] upsert topic", TOPIC.slug);

  const { data: topic, error: topicErr } = await sb
    .from("health_topics")
    .upsert(
      {
        slug: TOPIC.slug,
        title: TOPIC.title,
        description: TOPIC.description,
        keywords: TOPIC.keywords,
        status: TOPIC.status,
        priority: TOPIC.priority,
        cluster_roadmap: TOPIC.cluster_roadmap,
        metadata: TOPIC.metadata,
      },
      { onConflict: "slug" },
    )
    .select()
    .single();
  if (topicErr) throw topicErr;
  console.log("    topic id:", topic.id);

  // ─────────────────────────────────────────────
  console.log("[2/5] link existing papers");
  const { data: linkedPapers, error: linkErr } = await sb
    .from("health_sources")
    .update({ topic_id: topic.id })
    .in("pmid", EXISTING_PAPER_PMIDS)
    .select("id, pmid, title");
  if (linkErr) throw linkErr;
  for (const p of linkedPapers ?? []) {
    console.log(`    ✓ ${p.pmid}  ${p.title.slice(0, 60)}…`);
  }

  // BMJ id 확보 (글 #1 source_ids 용)
  const bmj = (linkedPapers ?? []).find((p) => p.pmid === "40533200");
  if (!bmj) throw new Error("BMJ paper (PMID 40533200) not found in DB");

  // ─────────────────────────────────────────────
  console.log("[3/5] upsert news sources");
  const newsUrls = NEWS.map((n) => n.url);
  const { data: existingNews } = await sb
    .from("health_sources")
    .select("id, url")
    .in("url", newsUrls);
  const existingUrlMap = new Map((existingNews ?? []).map((r) => [r.url, r.id]));

  const newsToInsert = NEWS.filter((n) => !existingUrlMap.has(n.url)).map((n) => ({
    ...n,
    topic_id: topic.id,
    collected_by: ACTOR,
  }));

  let insertedNews = [];
  if (newsToInsert.length > 0) {
    const { data, error } = await sb
      .from("health_sources")
      .insert(newsToInsert)
      .select("id, url");
    if (error) throw error;
    insertedNews = data ?? [];
    for (const r of insertedNews) {
      console.log(`    + ${r.url}`);
    }
  }

  // 기존 뉴스도 topic_id / status='used' 갱신
  if (existingUrlMap.size > 0) {
    await sb
      .from("health_sources")
      .update({ topic_id: topic.id, status: "used" })
      .in("url", [...existingUrlMap.keys()]);
    for (const u of existingUrlMap.keys()) {
      console.log(`    = ${u} (already existed, updated)`);
    }
  }

  // 뉴스 id 모음
  const allNewsIds = [
    ...existingUrlMap.values(),
    ...insertedNews.map((r) => r.id),
  ];

  // ─────────────────────────────────────────────
  console.log("[4/5] upsert content", POST.slug);
  const sourceIds = [bmj.id, ...allNewsIds];

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
  console.log("[5/5] update cluster_roadmap with content_id and audit log");
  // roadmap 의 #1 항목에 content_id 박아두기
  const updatedRoadmap = TOPIC.cluster_roadmap.map((r) =>
    r.order === 1 ? { ...r, content_id: postId, status: "draft" } : r,
  );
  await sb
    .from("health_topics")
    .update({ cluster_roadmap: updatedRoadmap })
    .eq("id", topic.id);

  await sb.from("health_admin_actions").insert({
    actor_email: ACTOR,
    action: "seed_topic_and_sample_content",
    target_type: "health_topics",
    target_id: topic.id,
    payload: {
      topic_slug: TOPIC.slug,
      content_slug: POST.slug,
      content_id: postId,
      linked_papers: EXISTING_PAPER_PMIDS,
      news_inserted: insertedNews.length,
      news_existed: existingUrlMap.size,
      source_ids: sourceIds,
    },
  });

  console.log("\n✅ done");
  console.log("   topic:", topic.id, TOPIC.slug);
  console.log("   post: ", postId, POST.slug, "(", POST.status, ")");
  console.log("   sources linked:", sourceIds.length);
}

await run().catch((e) => {
  console.error("\n❌ failed:", e.message ?? e);
  if (e.details) console.error("   details:", e.details);
  if (e.hint) console.error("   hint:", e.hint);
  process.exit(1);
});
