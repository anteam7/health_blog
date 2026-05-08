import { NextResponse } from "next/server";
import { createClient as createSSRClient, isAdminEmail } from "@/lib/auth/server";
import { trackDownload } from "@/lib/unsplash";

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

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  let body: { download_location?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const url =
    typeof body.download_location === "string" ? body.download_location : "";
  if (!url) {
    return NextResponse.json({ error: "download_location_required" }, { status: 400 });
  }
  await trackDownload(url);
  return NextResponse.json({ ok: true });
}
