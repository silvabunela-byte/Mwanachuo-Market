"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Info,
  MapPin,
  MessageCircle,
  PackageSearch,
  RefreshCw,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { openAd, trackAdClick } from "@/lib/ads";
import { MOCK_LISTINGS } from "@/lib/mockData";
import { BROKEN_IMAGE, formatPrice, timeAgo } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import ProductDetailModal from "@/components/ProductDetailModal";
import PostAdModal from "@/components/PostAdModal";
import ManageListingsModal from "@/components/ManageListingsModal";
import { AdBanner, HouseAd } from "@/components/AdBanner";
import {
  CAMPUS_LOCATIONS,
  CATEGORIES,
  type Category,
  type CampusLocation,
  type Listing,
  type LocalAd,
} from "@/types/database";

const FEED_BANNER_INTERVAL = 6;

/* ---------- Kadi ya bidhaa ---------- */
function ListingCard({
  listing,
  onOpen,
}: {
  listing: Listing;
  onOpen: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const cover =
    !broken && listing.image_urls && listing.image_urls.length > 0
      ? listing.image_urls[0]
      : BROKEN_IMAGE;
  const isNew = listing.condition === "Mpya";

  const message = `Habari ${listing.seller_name}, nimeona "${listing.title}" (TSh ${listing.price.toLocaleString(
    "en-US"
  )}) kwenye Mwanachuo Market. Je, bado ipo?`;
  const whatsappUrl = `https://wa.me/${listing.whatsapp_number}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <article className="group flex w-full min-w-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col text-left"
        aria-label={`Angalia maelezo ya ${listing.title}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {listing.is_sponsored && (
            <span className="absolute left-2 top-2 rounded-full bg-[#F97316] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              Sponsored
            </span>
          )}
          <span
            className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isNew
                ? "bg-emerald-100 text-emerald-700"
                : "bg-stone-200 text-stone-700"
            }`}
          >
            {listing.condition}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-base font-extrabold text-slate-900">
            {formatPrice(listing.price)}
          </p>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-slate-900">
            {listing.title}
          </h3>
          <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{listing.campus_location}</span>
          </p>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex min-w-0 items-center gap-1">
              <span className="truncate">{listing.seller_name}</span>
              {listing.is_verified && (
                <BadgeCheck
                  className="h-4 w-4 shrink-0 text-[#059669]"
                  aria-label="Mwanachuo Aliyethibitishwa"
                />
              )}
            </span>
            <span className="shrink-0">{timeAgo(listing.created_at)}</span>
          </div>
        </div>
      </button>
      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Maelezo
        </button>
        <button
          type="button"
          onClick={() =>
            window.open(whatsappUrl, "_blank", "noopener,noreferrer")
          }
          className="flex items-center justify-center gap-1 rounded-lg bg-[#059669] px-2 py-2 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </button>
      </div>
    </article>
  );
}

/* ---------- Bango kuu linalozunguka ---------- */
function TopBanner({
  ads,
  onClick,
}: {
  ads: LocalAd[];
  onClick: (ad: LocalAd) => void;
}) {
  const [index, setIndex] = useState(0);

   // Timer inaanza upya kila index inapobadilika (pia mtumiaji akibonyeza nukta)
  useEffect(() => {
    if (ads.length < 2) return;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [ads.length, index]);

  useEffect(() => {
    if (index >= ads.length) setIndex(0);
  }, [ads.length, index]);

  if (ads.length === 0) return <HouseAd tall />;
  const current = ads[index % ads.length];

  return (
    <div className="space-y-2">
      <AdBanner key={current.id} ad={current} onClick={onClick} tall />
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {ads.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Tangazo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index % ads.length
                  ? "w-5 bg-[#059669]"
                  : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

type FeedItem =
  | { type: "listing"; listing: Listing }
  | { type: "ad"; ad: LocalAd; key: string };

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [ads, setAds] = useState<LocalAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<Category>("Zote");
  const [campus, setCampus] = useState<string>("Maeneo Yote");
  const [selected, setSelected] = useState<Listing | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    let realListings: Listing[] = [];
    let realAds: LocalAd[] = [];
    try {
      const [listingsRes, adsRes] = await Promise.all([
        supabase
          .from("listings")
          .select("*")
          .eq("status", "approved")
          .order("is_sponsored", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("local_ads")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);
      if (!listingsRes.error) {
        realListings = (listingsRes.data ?? []) as Listing[];
      } else {
        console.error(listingsRes.error);
      }
      if (!adsRes.error) {
        realAds = (adsRes.data ?? []) as LocalAd[];
      } else {
        console.error(adsRes.error);
      }
    } catch (err) {
      console.error(err);
    }

    if (realListings.length === 0) {
      setListings(MOCK_LISTINGS);
      setUsingMock(true);
    } else {
      setListings(realListings);
      setUsingMock(false);
    }
    setAds(realAds);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Kitufe cha "+ Uza" kutoka kurasa nyingine kinaleta /?post=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("post") === "1") {
      setPostOpen(true);
      window.history.replaceState(null, "", "/");
    } else if (params.get("manage") === "1") {
      setManageOpen(true);
      window.history.replaceState(null, "", "/");
    }
  }, []);

  const handleAdClick = useCallback((ad: LocalAd) => {
    openAd(ad);
    setAds((prev) =>
      prev.map((a) =>
        a.id === ad.id ? { ...a, clicks_count: a.clicks_count + 1 } : a
      )
    );
    void trackAdClick(ad);
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return listings.filter((l) => {
           if (
        campus !== "Maeneo Yote" &&
        (l.campus_location ?? "").trim().toLowerCase() !==
          campus.trim().toLowerCase()
      )
        return false;
      if (campus !== "Maeneo Yote" && l.campus_location !== campus)
        return false;
      if (q) {
        const hay =
          `${l.title} ${l.description} ${l.seller_name} ${l.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [listings, searchQuery, category, campus]);
    // Orodha ya maeneo: ya kawaida + yale yaliyoandikwa na wauzaji
  const campusOptions = useMemo(() => {
    const options: string[] = [...CAMPUS_LOCATIONS];
    const seen = new Set(options.map((o) => o.toLowerCase()));
    for (const l of listings) {
      const loc = (l.campus_location ?? "").replace(/\s+/g, " ").trim();
      if (loc && !seen.has(loc.toLowerCase())) {
        seen.add(loc.toLowerCase());
        options.push(loc);
      }
    }
    return options;
  }, [listings]);

    const topAds = useMemo(
    () =>
      ads.filter(
        (a) => (a.placement ?? "").trim().toLowerCase() === "top_banner"
      ),
    [ads]
  );
  const feedAds = useMemo(
    () =>
      ads.filter(
        (a) => (a.placement ?? "").trim().toLowerCase() === "feed_banner"
      ),
    [ads]
  );

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    let adCursor = 0;
    filtered.forEach((listing, i) => {
      items.push({ type: "listing", listing });
      const isBreak = (i + 1) % FEED_BANNER_INTERVAL === 0;
      if (isBreak && i < filtered.length - 1) {
        if (feedAds.length > 0) {
          const ad = feedAds[adCursor % feedAds.length];
          items.push({ type: "ad", ad, key: `ad-${i}-${ad.id}` });
          adCursor += 1;
        }
      }
    });
    return items;
  }, [filtered, feedAds]);

  const hasFilters =
    searchQuery.trim() !== "" ||
    category !== "Zote" ||
    campus !== "Maeneo Yote";

  const resetFilters = () => {
    setSearchQuery("");
    setCategory("Zote");
    setCampus("Maeneo Yote");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenPostModal={() => setPostOpen(true)}
        onOpenManageModal={() => setManageOpen(true)}
      />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-4">
        <TopBanner ads={topAds} onClick={handleAdClick} />

        {usingMock && !loading && (
          <div className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-slate-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            Unaona bidhaa za mfano kwa sababu bado hakuna tangazo lililopitishwa
            kwenye database. Tangazo la kwanza likipitishwa, hizi zitatoweka.
          </div>
        )}

        {/* Makundi */}
        <section aria-label="Makundi">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-emerald-600 bg-[#059669] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* Eneo + idadi */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              aria-label="Chagua eneo la chuo"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            >
              {campusOptions.map((loc) => (
              <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          {!loading && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>
                {filtered.length === 1
                  ? "Tangazo 1"
                  : `Matangazo ${filtered.length}`}
              </span>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Futa vichujio
                </button>
              )}
            </div>
          )}
        </section>

        {/* Feed */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <PackageSearch className="h-12 w-12 text-slate-400" />
            <h2 className="text-base font-bold text-slate-900">
              Hakuna kilichopatikana
            </h2>
            <p className="max-w-xs text-sm text-slate-500">
              Jaribu neno lingine la kutafuta, au badilisha kundi na eneo la
              chuo.
            </p>
            <div className="flex gap-2">
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full bg-[#059669] px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Onyesha Zote
                </button>
              )}
              <button
                type="button"
                onClick={loadData}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Pakia Upya
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {feedItems.map((item) =>
              item.type === "listing" ? (
                <ListingCard
                  key={item.listing.id}
                  listing={item.listing}
                  onOpen={() => setSelected(item.listing)}
                />
              ) : (
                <div key={item.key} className="col-span-full">
                  <AdBanner ad={item.ad} onClick={handleAdClick} />
                </div>
              )
            )}
          </div>
        )}
      </main>

          <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Mwanachuo Market — Soko la wanachuo, kwa
        wanachuo.
      </footer>

      <ProductDetailModal
        listing={selected}
        onClose={() => setSelected(null)}
      />
      <ManageListingsModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        onChanged={loadData}
      />
      <PostAdModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onPosted={loadData}
      />
    </div>
  );
}
