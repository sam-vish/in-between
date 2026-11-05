import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Null until the env is set, so local builds and previews still run. */
export function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function cleanUtm(input: unknown) {
  const out: Record<string, string> = {};
  if (input && typeof input === "object") {
    for (const [k, v] of Object.entries(input).slice(0, 10)) {
      if (k.startsWith("utm_") && typeof v === "string") out[k.slice(0, 40)] = v.slice(0, 120);
    }
  }
  return out;
}
