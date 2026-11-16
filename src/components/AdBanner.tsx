"use client";
import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { LocalAd } from "@/lib/types";

export default function AdBanner({ placement = "top_banner" }: { placement?: string }) {
  const [ads, setAds] = useState<LocalAd[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("local_ads")
      .select("*")
      .eq("is_active", true)
      .eq("placement", placement)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAds((data as LocalAd[]) || []));
  }, [placement]);

  useEffect(() => {
    if (ads.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % ads.length), 6000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (!ads.length) return null;
  const ad = ads[idx];

  const click = () => {
    supabase.rpc("increment_ad_clicks", { ad_id: ad.id }).then(() => {});
  };

  return (
    <a
      href={ad.target_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={click}
      className="relative mb-8 block overflow-hidden rounded-2xl border-2 border-emerald-950/10"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ad.banner_url} alt={ad.business_name} className="h-28 w-full object-cover md:h-40" />
      <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
        Tangazo · {ad.business_name}
      </span>
    </a>
  );
}
