import { NextResponse } from "next/server";
import { createClient as createSSRClient, isAdminEmail } from "@/lib/auth/server";
import { searchPhotos } from "@/lib/unsplash";

async function requireAdmin() {
  const supabase = await createSSRClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { user: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { user, response: null as null };
}

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const url = new URL(req.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  if (!query) {
    return NextResponse.json({ error: "query_required" }, { status: 400 });
  }
  const page = Number(url.searchParams.get("page") ?? "1") || 1;
  const orientation =
    (url.searchParams.get("orientation") as
      | "landscape"
      | "portrait"
      | "squarish"
      | null) ?? "landscape";

  try {
    const data = await searchPhotos(query, { page, perPage: 12, orientation });
    // 응답을 슬림화 — 클라이언트가 필요한 필드만
    return NextResponse.json({
      total: data.total,
      total_pages: data.total_pages,
      results: data.results.map((p) => ({
        id: p.id,
        alt: p.alt_description ?? p.description ?? query,
        width: p.width,
        height: p.height,
        color: p.color,
        thumb: p.urls.thumb,
        small: p.urls.small,
        raw: p.urls.raw,
        regular: p.urls.regular,
        download_location: p.links.download_location,
        photographer: p.user.name,
        photographer_username: p.user.username,
        photographer_url: p.user.links.html,
        unsplash_url: p.links.html,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unsplash_failed" },
      { status: 500 },
    );
  }
}
