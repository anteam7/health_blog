import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

export function supabaseService() {
  if (!service) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, service, { auth: { persistSession: false } });
}

export function supabaseSSR(
  cookies: () => { get(name: string): { value: string } | undefined },
) {
  return createServerClient(url, anon, {
    cookies: {
      get: (n) => cookies().get(n)?.value,
    },
  });
}
