"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Star,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ADMIN_PIN } from "@/lib/config";
import { uploadImage } from "@/lib/storage";
import { BROKEN_IMAGE, formatDate, formatPrice, slugify } from "@/lib/utils";
import type { BlogPost, Listing, LocalAd } from "@/types/database";

type Tab = "bidhaa" | "ads" | "blogu";
type ListingFilter = "pending" | "approved" | "all";

const SESSION_KEY = "mm_admin_ok";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20";

const primaryBtn =
  "rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

function Notice({
  notice,
}: {
  notice: { type: "ok" | "err"; text: string } | null;
}) {
  if (!notice) return null;
  return (
    <p
      role="status"
      className={`rounded-xl px-3 py-2 text-sm font-medium ${
        notice.type === "ok"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {notice.text}
    </p>
  );
}

/* =========================== BIDHAA =========================== */
function ListingsTab() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ListingFilter>("pending");
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setNotice({ type: "err", text: error.message });
    else setItems((data ?? []) as Listing[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: string, values: Partial<Listing>) => {
    setNotice(null);
    const { error } = await supabase.from("listings").update(values).eq("id", id);
    if (error) {
      setNotice({ type: "err", text: error.message });
      return;
    }
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...values } : l)));
  };

  const remove = async (item: Listing) => {
    if (!window.confirm(`Futa tangazo "${item.title}"? Hili haliwezi kurudishwa.`))
      return;
    const { error } = await supabase.from("listings").delete().eq("id", item.id);
    if (error) {
      setNotice({ type: "err", text: error.message });
      return;
    }
    setItems((prev) => prev.filter((l) => l.id !== item.id));
    setNotice({ type: "ok", text: "Tangazo limefutwa." });
  };

  const visible = items.filter((l) =>
    filter === "all"
      ? true
      : filter === "approved"
      ? l.status === "approved"
      : l.status !== "approved"
  );
  const pendingCount = items.filter((l) => l.status !== "approved").length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", `Yanasubiri (${pendingCount})`],
            ["approved", "Yaliyopitishwa"],
            ["all", "Yote"],
          ] as [ListingFilter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
              filter === key
                ? "border-emerald-600 bg-[#059669] text-white"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <Notice notice={notice} />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-[#059669]" />
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Hakuna matangazo kwenye orodha hii.
        </p>
      ) : (
        visible.map((l) => (
          <div
            key={l.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
          >
            <img
              src={l.image_urls && l.image_urls[0] ? l.image_urls[0] : BROKEN_IMAGE}
              alt={l.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = BROKEN_IMAGE;
              }}
              className="h-24 w-full rounded-xl object-cover sm:w-32"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{l.title}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    l.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {l.status === "approved" ? "Imepitishwa" : "Inasubiri"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {formatPrice(l.price)} · {l.category} · {l.campus_location}
              </p>
              <p className="text-xs text-slate-500">
                {l.seller_name} · {l.whatsapp_number} · {formatDate(l.created_at)}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    patch(l.id, {
                      status: l.status === "approved" ? "pending" : "approved",
                    })
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    l.status === "approved"
                      ? "border border-slate-200 text-slate-700"
                      : "bg-[#059669] text-white"
                  }`}
                >
                  {l.status === "approved" ? "Ondoa Idhini" : "Pitisha"}
                </button>
                <button
                  type="button"
                  onClick={() => patch(l.id, { is_sponsored: !l.is_sponsored })}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold ${
                    l.is_sponsored
                      ? "bg-[#F97316] text-white"
                      : "border border-slate-200 text-slate-700"
                  }`}
                >
                  <Star className="h-3.5 w-3.5" />
                  Sponsored
                </button>
                <button
                  type="button"
                  onClick={() => patch(l.id, { is_verified: !l.is_verified })}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold ${
                    l.is_verified
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 text-slate-700"
                  }`}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </button>
                <button
                  type="button"
                  onClick={() => remove(l)}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Futa
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* =========================== LOCAL ADS =========================== */
function AdsTab() {
  const [ads, setAds] = useState<LocalAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const [businessName, setBusinessName] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [placement, setPlacement] = useState<"top_banner" | "feed_banner">(
    "top_banner"
  );
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("local_ads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setNotice({ type: "err", text: error.message });
    else setAds((data ?? []) as LocalAd[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNotice(null);
    if (businessName.trim().length < 2)
      return setNotice({ type: "err", text: "Weka jina la biashara." });
    if (!/^https?:\/\//i.test(targetUrl.trim()))
      return setNotice({
        type: "err",
        text: "Target URL lazima ianze na https:// (mfano link ya WhatsApp au Instagram).",
      });
    if (!bannerFile && !/^https?:\/\//i.test(bannerUrl.trim()))
      return setNotice({
        type: "err",
        text: "Pakia picha ya bango au weka link ya picha.",
      });

    setSaving(true);
    try {
      const finalBanner = bannerFile
        ? await uploadImage(bannerFile, "ads")
        : bannerUrl.trim();
      const { data, error } = await supabase
        .from("local_ads")
        .insert({
          business_name: businessName.trim(),
          banner_url: finalBanner,
          target_url: targetUrl.trim(),
          placement,
          is_active: true,
          clicks_count: 0,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      setAds((prev) => [data as LocalAd, ...prev]);
      setBusinessName("");
      setBannerUrl("");
      setBannerFile(null);
      setTargetUrl("");
      setNotice({ type: "ok", text: "Bango limeongezwa." });
    } catch (err) {
      setNotice({
        type: "err",
        text: err instanceof Error ? err.message : "Imeshindwa kuongeza bango.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: LocalAd) => {
    const { error } = await supabase
      .from("local_ads")
      .update({ is_active: !ad.is_active })
      .eq("id", ad.id);
    if (error) return setNotice({ type: "err", text: error.message });
    setAds((prev) =>
      prev.map((a) => (a.id === ad.id ? { ...a, is_active: !a.is_active } : a))
    );
  };

  const remove = async (ad: LocalAd) => {
    if (!window.confirm(`Futa bango la "${ad.business_name}"?`)) return;
    const { error } = await supabase.from("local_ads").delete().eq("id", ad.id);
    if (error) return setNotice({ type: "err", text: error.message });
    setAds((prev) => prev.filter((a) => a.id !== ad.id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900">
          Ongeza Bango Jipya
        </h3>
        <input
          className={inputClass}
          placeholder="Jina la biashara (mfano: Mama Lishe Express & Biriani)"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Pakia picha ya bango
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              AU weka link ya picha
            </label>
            <input
              className={inputClass}
              placeholder="https://..."
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              disabled={bannerFile !== null}
            />
          </div>
        </div>
        <input
          className={inputClass}
          placeholder="Target URL (https://wa.me/255... au Instagram)"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
        />
        <select
          className={inputClass}
          value={placement}
          onChange={(e) =>
            setPlacement(e.target.value as "top_banner" | "feed_banner")
          }
        >
          <option value="top_banner">Bango Kuu la Juu (top_banner)</option>
          <option value="feed_banner">Bango la Kati (feed_banner)</option>
        </select>
        <Notice notice={notice} />
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className={primaryBtn}
        >
          {saving ? "Inahifadhi..." : "Ongeza Bango"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-[#059669]" />
        </div>
      ) : ads.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Bado hakuna mabango.
        </p>
      ) : (
        ads.map((ad) => (
          <div
            key={ad.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
          >
            <img
              src={ad.banner_url}
              alt={ad.business_name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = BROKEN_IMAGE;
              }}
              className="h-20 w-full rounded-xl object-cover sm:w-40"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {ad.business_name}
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {ad.placement === "top_banner" ? "Juu" : "Kati"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    ad.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {ad.is_active ? "Linaonekana" : "Limezimwa"}
                </span>
              </div>
              <p className="truncate text-xs text-slate-500">{ad.target_url}</p>
              <p className="text-xs font-semibold text-slate-900">
                Mabonyezo: {ad.clicks_count}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleActive(ad)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  {ad.is_active ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {ad.is_active ? "Zima" : "Washa"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(ad)}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Futa
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* =========================== BLOGU =========================== */
function BlogsTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Maisha ya Chuo");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setNotice({ type: "err", text: error.message });
    else setPosts((data ?? []) as BlogPost[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTitle = (value: string) => {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const handlePublish = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNotice(null);
    const finalSlug = slugify(slug || title);
    if (title.trim().length < 3)
      return setNotice({ type: "err", text: "Weka kichwa cha makala." });
    if (!finalSlug)
      return setNotice({ type: "err", text: "Slug si sahihi." });
    if (content.trim().length < 20)
      return setNotice({ type: "err", text: "Andika maudhui ya makala." });

    setSaving(true);
    const { data, error } = await supabase
      .from("blogs")
      .insert({
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        cover_image: coverImage.trim() || null,
        category: category.trim() || "Maisha ya Chuo",
      })
      .select()
      .single();
    setSaving(false);

    if (error) {
      setNotice({
        type: "err",
        text:
          error.code === "23505"
            ? "Slug hii tayari ipo. Badilisha slug iwe ya kipekee."
            : error.message,
      });
      return;
    }
    setPosts((prev) => [data as BlogPost, ...prev]);
    setTitle("");
    setSlug("");
    setSlugEdited(false);
    setExcerpt("");
    setCoverImage("");
    setContent("");
    setNotice({ type: "ok", text: "Makala imechapishwa." });
  };

  const remove = async (post: BlogPost) => {
    if (!window.confirm(`Futa makala "${post.title}"?`)) return;
    const { error } = await supabase.from("blogs").delete().eq("id", post.id);
    if (error) return setNotice({ type: "err", text: error.message });
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900">
          Andika Makala Mpya
        </h3>
        <input
          className={inputClass}
          placeholder="Kichwa cha makala"
          value={title}
          onChange={(e) => handleTitle(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="slug-ya-makala"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
          />
          <input
            className={inputClass}
            placeholder="Kundi (mfano: Biashara)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <input
          className={inputClass}
          placeholder="Link ya picha ya jalada (hiari)"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-[70px]`}
          placeholder="Muhtasari mfupi (excerpt)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-[220px]`}
          placeholder={
            "Maudhui kamili.\n\nTenganisha aya kwa mstari mtupu.\n\n## Anza mstari kwa ## kutengeneza kichwa kidogo"
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Notice notice={notice} />
        <button
          type="button"
          onClick={handlePublish}
          disabled={saving}
          className={primaryBtn}
        >
          {saving ? "Inachapisha..." : "Chapisha Makala"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-[#059669]" />
        </div>
      ) : posts.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Bado hakuna makala kwenye database. Makala za mfano zinaonyeshwa
          kwenye blogu mpaka uchapishe ya kwanza.
        </p>
      ) : (
        posts.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900">
                {p.title}
              </h3>
              <p className="text-xs text-slate-500">
                {p.category} · {formatDate(p.created_at)} ·{" "}
                <Link
                  href={`/blog/${p.slug}`}
                  className="font-semibold text-emerald-700"
                >
                  Tazama
                </Link>
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(p)}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Futa
            </button>
          </div>
        ))
      )}
    </div>
  );
}

/* =========================== ADMIN =========================== */
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState<Tab>("bidhaa");

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
    } catch {
      /* sessionStorage haipatikani */
    }
    setChecked(true);
  }, []);

  const login = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthed(true);
      setPinError(false);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* haina madhara */
      }
    } else {
      setPinError(true);
    }
  };

  const logout = () => {
    setAuthed(false);
    setPin("");
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* haina madhara */
    }
  };

  if (!checked) return null;

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#059669] text-white">
              <Lock className="h-6 w-6" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Admin - Mwanachuo Market
            </h1>
            <p className="text-sm text-slate-500">Weka PIN kuendelea.</p>
          </div>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setPinError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pin === ADMIN_PIN) {
                  setAuthed(true);
                  try {
                    window.sessionStorage.setItem(SESSION_KEY, "1");
                  } catch {
                    /* haina madhara */
                  }
                } else {
                  setPinError(true);
                }
              }
            }}
            placeholder="PIN"
            className={inputClass}
          />
          {pinError && (
            <p className="text-sm font-medium text-red-600">
              PIN si sahihi. Jaribu tena.
            </p>
          )}
          <button type="button" onClick={login} className={`${primaryBtn} w-full`}>
            Ingia
          </button>
          <Link
            href="/"
            className="block text-center text-sm font-semibold text-emerald-700"
          >
            ← Rudi Sokoni
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-extrabold text-slate-900">
            Admin <span className="text-[#059669]">Dashboard</span>
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-emerald-700">
              Soko
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Toka
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-4xl gap-2 px-4 pb-3">
          {(
            [
              ["bidhaa", "Bidhaa"],
              ["ads", "Local Ads"],
              ["blogu", "Blogu"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                tab === key
                  ? "border-emerald-600 bg-[#059669] text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5">
        {tab === "bidhaa" && <ListingsTab />}
        {tab === "ads" && <AdsTab />}
        {tab === "blogu" && <BlogsTab />}
      </main>
    </div>
  );
}
