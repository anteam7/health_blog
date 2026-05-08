// Gemini 2.5 Flash 호출 helper — AI 검토 전용. 서버 사이드만.

import { extractJson } from "./reviews";

const GEMINI_MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface GeminiReviewResponse {
  rawText: string;
  parsed: Record<string, unknown> | null;
  finishReason: string | undefined;
  groundingUrls: string[];
  usage: Record<string, unknown> | undefined;
  blockReason: string | undefined;
}

export async function callGeminiReview(
  systemPrompt: string,
  userPrompt: string,
  opts: { useGrounding: boolean },
): Promise<GeminiReviewResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const requestBody: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 16384 },
  };
  if (opts.useGrounding) {
    requestBody.tools = [{ google_search: {} }];
  }

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${t.slice(0, 500)}`);
  }

  const gemini = (await res.json()) as {
    candidates?: {
      content?: { parts?: { text?: string }[] };
      finishReason?: string;
      groundingMetadata?: {
        groundingChunks?: { web?: { uri?: string; title?: string } }[];
      };
    }[];
    promptFeedback?: { blockReason?: string };
    usageMetadata?: Record<string, unknown>;
  };

  const candidate = gemini.candidates?.[0];
  const rawText = (candidate?.content?.parts ?? [])
    .map((p) => p?.text ?? "")
    .join("");
  const parsed = extractJson(rawText);
  const groundingUrls = (candidate?.groundingMetadata?.groundingChunks ?? [])
    .map((c) => c.web?.uri)
    .filter((u): u is string => typeof u === "string");

  return {
    rawText,
    parsed,
    finishReason: candidate?.finishReason,
    groundingUrls,
    usage: gemini.usageMetadata,
    blockReason: gemini.promptFeedback?.blockReason,
  };
}

export const GEMINI_REVIEW_MODEL = GEMINI_MODEL;
