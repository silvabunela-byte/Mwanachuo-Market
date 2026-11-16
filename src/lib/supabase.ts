import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = Boolean(url && key);

// Placeholder values keep the build from crashing if env vars are missing.
export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key"
);

export const IMAGE_BUCKET = "product-images";
