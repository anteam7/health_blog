import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/auth/admin-supabase";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "헬스스캐너 블로그";

const SITE_NAME = "헬스스캐너";
const PRETENDARD_BOLD =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2";
const PRETENDARD_REGULAR =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2";

async function getPost(slug: string) {
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("health_contents")
      .select("title, excerpt, cover_image_url, tags")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle<{
        title: string;
        excerpt: string | null;
        cover_image_url: string | null;
        tags: string[] | null;
      }>();
    return data;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  const title = post?.title ?? SITE_NAME;
  const excerpt = post?.excerpt ?? null;
  const cover = post?.cover_image_url ?? null;
  const tag = post?.tags?.[0] ?? null;

  // 한글 폰트 fetch (병렬)
  const [boldFont, regularFont] = await Promise.all([
    fetch(PRETENDARD_BOLD).then((r) => r.arrayBuffer()),
    fetch(PRETENDARD_REGULAR).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: "#0f172a",
          fontFamily: "Pretendard",
        }}
      >
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.85) 100%)",
              }}
            />
          </>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
            }}
          />
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
            color: "#fff",
          }}
        >
          {/* 상단: 사이트명 + 태그 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  backgroundColor: "#60a5fa",
                }}
              />
              {SITE_NAME}
            </div>
            {tag && (
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 400,
                  padding: "6px 16px",
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                {tag}
              </div>
            )}
          </div>

          {/* 하단: 제목 + excerpt */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: title.length > 30 ? 56 : 64,
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                maxWidth: "92%",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </div>
            {excerpt && (
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 400,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.85)",
                  maxWidth: "88%",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {excerpt.length > 110 ? excerpt.slice(0, 108) + "…" : excerpt}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: boldFont, weight: 700, style: "normal" },
        {
          name: "Pretendard",
          data: regularFont,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
