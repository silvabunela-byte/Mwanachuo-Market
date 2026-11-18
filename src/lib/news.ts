import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/** Je, kuna habari yoyote iliyowekewa alama ya MPYA? */
export async function hasNewNews(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { count, error } = await supabase
      .from("news")
      .select("id", { count: "exact", head: true })
      .eq("is_new", true);
    if (error) return false;
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}
