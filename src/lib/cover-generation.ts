// Gemini 이미지 생성 모델 ("Nano Banana") 로 cover 이미지 생성 + Supabase Storage 저장.
// jimscanner blog-cover.ts 패턴 기반, health_blog 컨텍스트(다이어트·건강 블로그) 로 변환.

import { createAdminClient } from "@/lib/auth/admin-supabase";

const BUCKET = "health-blog-covers";

// 모델 우선순위 — 신모델 실패 시 폴백
const MODELS = [
  "gemini-3.1-flash-image-preview", // Nano Banana 2 (2026-02)
  "gemini-2.5-flash-image", // Nano Banana 1 (폴백)
];

const COMMON_STYLE = `Style: clean editorial illustration, magazine-cover quality, 16:9 landscape composition.
No text, no watermark, no logo. Generous negative space. Centered hero composition.
Photo-real or polished illustration acceptable, but avoid over-saturated AI-art look.`;

// 토픽 힌트 → 색감/분위기 (다이어트·건강 블로그 톤)
function paletteForTags(tags: string[] | null): string {
  const ts = (tags ?? []).join(" ");
  if (/단식|fasting/i.test(ts))
    return "warm cream and soft sage green palette, fresh and calming wellness mood";
  if (/지방간|간|liver|NAFLD/i.test(ts))
    return "soft mint green and warm cream palette, clean medical-magazine mood";
  if (/근손실|근육|muscle|단백질|protein/i.test(ts))
    return "neutral gray-beige and deep teal accents, athletic editorial mood";
  if (/부작용|side effect|adverse/i.test(ts))
    return "soft amber and muted slate palette, careful and trustworthy mood";
  if (/자가포식|autophagy/i.test(ts))
    return "soft lavender and clean white palette, science-illustration mood";
  if (/다이어트|diet|weight/i.test(ts))
    return "fresh sage and warm peach palette, light and approachable wellness mood";
  return "warm cream background with soft sage green accents, clean editorial wellness mood";
}

function buildPrompt(args: {
  title: string;
  tags?: string[] | null;
  customPrompt?: string | null;
}): string {
  if (args.customPrompt && args.customPrompt.trim().length > 0) {
    return args.customPrompt.trim();
  }
  const palette = paletteForTags(args.tags ?? null);
  return `A clean, modern editorial illustration for a Korean health and diet blog cover.

Color palette: ${palette}.
${COMMON_STYLE}

Topic: ${args.title}`;
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
  customPrompt?: string | null;
}): Promise<GenerateCoverResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const prompt = buildPrompt({
    title: args.title,
    tags: args.tags,
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
