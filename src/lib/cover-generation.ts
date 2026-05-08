// Gemini 이미지 생성 모델 ("Nano Banana") 로 cover 이미지 생성 + Supabase Storage 저장.
// jimscanner blog-cover.ts 패턴 기반, health_blog 컨텍스트(다이어트·건강 블로그) 로 변환.

import { createAdminClient } from "@/lib/auth/admin-supabase";

const BUCKET = "health-blog-covers";

// 모델 우선순위 — 신모델 실패 시 폴백
const MODELS = [
  "gemini-3.1-flash-image-preview", // Nano Banana 2 (2026-02)
  "gemini-2.5-flash-image", // Nano Banana 1 (폴백)
];

// 실사 사진 톤 강제 — 일러스트·AI-art 룩 회피, 매거진 라이프스타일 포토그래피로
const PHOTO_STYLE = `Style: photo-realistic, professional editorial photography, shot with high-end DSLR camera, natural soft window light, shallow depth of field, magazine-quality lifestyle/food photography.
NOT illustration, NOT vector art, NOT 3D render, NOT painting, NOT cartoon. Avoid AI-art look, avoid HDR over-processing, avoid surreal elements.
Composition: 16:9 landscape, centered hero subject, generous negative space, real-world textures and authentic materials.
No text, no watermark, no logo, no human faces (objects and hands OK), no stock-photo cliché poses.`;

// 토픽 힌트 → 시각 모티프 (실사 사진으로 표현 가능한 구체 사물)
function visualMotifForTags(tags: string[] | null, title: string): string {
  const all = `${(tags ?? []).join(" ")} ${title}`;

  // 격일 단식 — 빈 접시 vs 일반 식사 대비
  if (/격일|ADF|alternate/i.test(all))
    return "Two ceramic plates side by side on a wooden kitchen table — left plate empty with just a sprig of greens, right plate with a small portion of grilled chicken breast and salad. Symbolizing alternating fasting/eating days. Warm cream linen napkin, soft window light. Color palette: warm cream, sage green, natural wood tones.";

  // 16:8 / 시간제한식 — 시계 + 식사 시간
  if (/16:8|시간제한|time-restricted|TRE/i.test(all))
    return "A modern minimalist clock face beside a plated healthy meal — grilled salmon, quinoa, roasted vegetables — on a marble countertop. Soft afternoon window light casting warm shadows. Color palette: warm cream, soft sage green, subtle gold from the clock.";

  // 5:2 — 분할 식사
  if (/5:?2/i.test(all))
    return "A weekly meal-prep flat lay — five normal-portion meals neatly arranged in glass containers + two smaller portions on a side. Wooden cutting board background, fresh herbs, natural daylight. Color palette: cream, sage green, warm wood.";

  // 지방간 / NAFLD — 간 친화 음식 + 의료 톤
  if (/지방간|liver|NAFLD/i.test(all))
    return "A clean still life of liver-friendly foods on a marble surface — green leafy vegetables, blueberries, walnuts, olive oil, a glass of water. Subtle medical magazine feel. Soft cool window light. Color palette: soft mint green, warm cream, natural produce colors.";

  // 근손실 / 단백질 / 운동
  if (/근손실|근육|muscle|단백질|protein/i.test(all))
    return "A flat lay of high-protein foods on a slate-gray surface — grilled chicken breast, eggs, Greek yogurt, almonds, a measuring cup of whey protein powder. Natural side light, gym towel and dumbbells faintly visible at edge. Color palette: neutral gray, deep teal, warm protein-food browns.";

  // 부작용 — 조심스러운 톤
  if (/부작용|side effect|adverse|두통|생리/i.test(all))
    return "A serene morning scene — a glass of water with electrolyte tablet, a small bowl of mixed fruit, soft cotton blanket, on a wooden table by a window. Calming, careful mood. Color palette: soft amber, muted slate gray, warm wood.";

  // 자가포식 / 16시간 단식 / 카피 검증
  if (/자가포식|autophagy|16시간|세포/i.test(all))
    return "A still life conveying time and renewal — an analog clock showing 16 hours, an empty white plate, a single sprig of green herbs, on a clean linen background. Editorial magazine mood, scientific yet approachable. Color palette: soft lavender-tinted white, warm cream, subtle silver from the clock.";

  // 격일 단식 결과 / 1년 RCT / 다이어트 효과
  if (/RCT|결과|효과|1년|장기/i.test(all))
    return "A weight loss progress flat lay on a wooden table — a measuring tape, a notebook with handwritten food log, a green apple, a glass of water, soft natural light. Editorial documentary mood. Color palette: warm cream, sage green, natural wood.";

  // 다이어트 일반
  if (/다이어트|diet|weight/i.test(all))
    return "A vibrant bowl of mixed greens, grilled chicken, avocado, and quinoa on a wooden table, with a side of fresh-squeezed juice and a notebook. Bright morning window light. Color palette: fresh sage green, warm peach, natural wood.";

  // Pillar / 완전 가이드
  if (/완전|가이드|complete|guide/i.test(all))
    return "An overhead flat lay of a complete healthy day spread — breakfast bowl, lunch salad, dinner protein plate, water bottle, a notebook — on a linen tablecloth. Comprehensive, organized, magazine cover style. Color palette: warm cream, sage green, natural wood, soft accent colors.";

  // 기본
  return "A still life of fresh, healthy whole foods — leafy greens, berries, nuts, grilled protein — arranged on a wooden cutting board with soft natural window light. Editorial wellness magazine style. Color palette: warm cream, sage green, natural produce colors.";
}

// 글 핵심 메시지 추출 — title + excerpt + 첫 본문 단락 일부
function distillContent(args: {
  title: string;
  excerpt?: string | null;
  bodyMd?: string | null;
}): string {
  const parts: string[] = [];
  parts.push(`Article title: "${args.title}"`);
  if (args.excerpt && args.excerpt.trim().length > 0) {
    parts.push(`Article summary: ${args.excerpt.trim()}`);
  }
  if (args.bodyMd && args.bodyMd.trim().length > 0) {
    // 인용블록 요약 카드 안의 첫 두 불릿만 추출 — 글 핵심
    const lines = args.bodyMd.split(/\r?\n/);
    const bullets: string[] = [];
    for (const l of lines) {
      const m = l.match(/^>\s*-\s+(.+)$/);
      if (m) {
        // 마크다운 강조·링크 제거
        const clean = m[1]
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .trim();
        if (clean.length > 0) bullets.push(clean);
        if (bullets.length >= 2) break;
      }
    }
    if (bullets.length > 0) {
      parts.push(`Key points: ${bullets.join(" / ")}`);
    }
  }
  return parts.join("\n");
}

function buildPrompt(args: {
  title: string;
  tags?: string[] | null;
  excerpt?: string | null;
  bodyMd?: string | null;
  customPrompt?: string | null;
}): string {
  if (args.customPrompt && args.customPrompt.trim().length > 0) {
    return args.customPrompt.trim();
  }

  const motif = visualMotifForTags(args.tags ?? null, args.title);
  const content = distillContent({
    title: args.title,
    excerpt: args.excerpt,
    bodyMd: args.bodyMd,
  });

  return `A photo-realistic 16:9 cover image for a Korean health and diet blog article.

${content}

Visual concept (translate the article's core message into a tangible, real-world scene):
${motif}

${PHOTO_STYLE}`;
}

export interface GenerateCoverResult {
  publicUrl: string;
  modelUsed: string;
  sizeKB: number;
  promptUsed: string;
}

export async function generateAndStoreCover(args: {
  contentId: string;
  slug: string;
  title: string;
  tags?: string[] | null;
  excerpt?: string | null;
  bodyMd?: string | null;
  customPrompt?: string | null;
}): Promise<GenerateCoverResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const prompt = buildPrompt({
    title: args.title,
    tags: args.tags,
    excerpt: args.excerpt,
    bodyMd: args.bodyMd,
    customPrompt: args.customPrompt,
  });

  let response: Response | null = null;
  let modelUsed = "";
  let lastError = "";

  for (const model of MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      },
    );
    if (res.ok) {
      response = res;
      modelUsed = model;
      break;
    }
    const t = await res.text().catch(() => "");
    lastError = `${model} → ${res.status}: ${t.slice(0, 200)}`;
  }

  if (!response) {
    throw new Error(`이미지 생성 실패: ${lastError}`);
  }

  const data = (await response.json()) as {
    candidates?: {
      content?: {
        parts?: { inlineData?: { data?: string; mimeType?: string } }[];
      };
    }[];
  };
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.data,
  );
  if (!imagePart?.inlineData?.data) {
    throw new Error("이미지 응답 없음");
  }

  const b64 = imagePart.inlineData.data;
  const mimeType = imagePart.inlineData.mimeType ?? "image/png";
  const ext = mimeType.includes("jpeg") ? "jpg" : "png";

  const buffer = Buffer.from(b64, "base64");
  const path = `${args.slug}.${ext}`;

  const sb = createAdminClient();
  const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: true,
    cacheControl: "31536000",
  });
  if (upErr) {
    throw new Error(`Storage 업로드 실패: ${upErr.message}`);
  }

  const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(path);
  // 캐시 버스팅
  const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

  return {
    publicUrl,
    modelUsed,
    sizeKB: Math.round(buffer.length / 1024),
    promptUsed: prompt,
  };
}
