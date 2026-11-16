"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, MessageCircle, Search, X } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Listing } from "@/lib/types";
import { CATEGORIES, formatTSh, waLink } from "@/lib/config";
import ListingCard from "@/components/ListingCard";
import AdBanner from "@/components/AdBanner";
import SetupNotice from "@/components/SetupNotice";

export default function MarketPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Zote");
  const [open, setOpen] = useState<Listing | null>(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .order("is_sponsored", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as Listing[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter(
      (i) =>
        (cat === "Zote" || i.category === cat) &&
        (!s ||
          i.title.toLowerCase().includes(s) ||
          (i.description || "").toLowerCase().includes(s) ||
          (i.campus_location || "").toLowerCase().includes(s))
    );
  }, [items, q, cat]);

  return (
    <>
      <SetupNotice />
      <section className="mb-8 grid gap-6 rounded-3xl bg-emerald-900 p-6 text-amber-50 md:grid-cols-[1.4fr_1fr] md:p-10">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Soko la wanachuo Tanzania</p>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            Nunua kwa bei ya mwanachuo. <span className="text-amber-300">Uza</span> usichokitumia.
          </h1>
          <p className="mt-3 max-w-md text-amber-50/80">
            Vitabu, simu, laptop, vifaa vya hosteli — moja kwa moja kutoka kwa wanachuo wenzako. Ongea na muuzaji kupitia WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/uza" className="btn-accent">Weka Bidhaa Bure</Link>
            <Link href="/tangaza" className="btn border-2 border-amber-50/30 text-amber-50 hover:border-amber-50">
              Tangaza Biashara
            </Link>
          </div>
        </div>
        <div className="self-end">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/50" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tafuta bidhaa au chuo..."
              className="input !rounded-full !py-3.5 !pl-11 text-emerald-950"
            />
          </label>
        </div>
      </section>

      <AdBanner />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {["Zote", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border-2 px-4 py-1.5 text-sm font-bold transition ${
              cat === c ? "border-emerald-900 bg-emerald-900 text-amber-50" : "border-emerald-900/15 hover:border-emerald-900"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card aspect-[3/4] animate-pulse bg-emerald-900/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl font-bold">Hakuna bidhaa bado.</p>
          <p className="mt-1 text-emerald-950/60">Kuwa wa kwanza kuweka bidhaa yako sokoni!</p>
          <Link href="/uza" className="btn-primary mt-4">Uza Bidhaa</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {filtered.map((i) => (
            <ListingCard
              key={i.id}
              item={i}
              onOpen={() => {
                setOpen(i);
                setImgIdx(0);
              }}
            />
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-emerald-950/70 p-4" onClick={() => setOpen(null)}>
          <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video bg-emerald-900/5">
              {open.image_urls?.length ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={open.image_urls[imgIdx]} alt={open.title} className="h-full w-full object-contain" />
              ) : null}
              <button onClick={() => setOpen(null)} className="absolute right-3 top-3 rounded-full bg-white p-1.5" aria-label="Funga">
                <X size={18} />
              </button>
            </div>
            {(open.image_urls?.length || 0) > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {open.image_urls!.map((u, n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={u}
                    src={u}
                    alt=""
                    onClick={() => setImgIdx(n)}
                    className={`h-14 w-14 cursor-pointer rounded-lg object-cover ${n === imgIdx ? "ring-2 ring-emerald-700" : "opacity-60"}`}
                  />
                ))}
              </div>
            )}
            <div className="space-y-3 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {open.category} · {open.condition}
              </p>
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
                {open.title} {open.is_verified && <BadgeCheck className="text-sky-600" />}
              </h2>
              <p className="font-display text-3xl font-bold text-emerald-900">{formatTSh(open.price)}</p>
              {open.description && <p className="whitespace-pre-line text-emerald-950/80">{open.description}</p>}
              <p className="flex items-center gap-1 text-sm text-emerald-950/60">
                <MapPin size={14} /> {open.campus_location || "—"} · Muuzaji: <strong>{open.seller_name}</strong>
              </p>
              <a
                href={waLink(open.whatsapp_number, `Habari ${open.seller_name}, nimeona "${open.title}" kwenye Mwanachuo Market. Bado ipo?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full"
              >
                <MessageCircle size={18} /> Wasiliana kwa WhatsApp
              </a>
              <p className="text-center text-xs text-emerald-950/50">Kutana sehemu ya wazi chuoni. Usitume pesa kabla ya kuona bidhaa.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
