import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getSupabaseConfig } from "./config";

// Plain anon Supabase client — no cookies, so it's safe to call from inside
// `unstable_cache` (see src/data/index.ts). RLS still applies: only rows
// with `is_active = true` are readable via the anon key.
export function publicSupabaseClient() {
  const { url, key } = getSupabaseConfig();
  return createSupabaseClient<Database>(
    url,
    key,
  );
}
