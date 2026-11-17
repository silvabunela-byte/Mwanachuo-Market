import { supabase } from "@/lib/supabase";
import type { LocalAd } from "@/types/database";

/** Huongeza clicks_count kwenye Supabase (RPC kwanza, kisha update ya kawaida). */
export async function trackAdClick(ad: LocalAd): Promise<void> {
  try {
    const { error } = await supabase.rpc("increment_ad_clicks", {
      ad_id: ad.id,
    });
    if (error) {
      await supabase
        .from("local_ads")
        .update({ clicks_count: ad.clicks_count + 1 })
        .eq("id", ad.id);
    }
  } catch (err) {
    console.error("Imeshindwa kuhifadhi click ya tangazo", err);
  }
}

export function openAd(ad: LocalAd): void {
  window.open(ad.target_url, "_blank", "noopener,noreferrer");
}
