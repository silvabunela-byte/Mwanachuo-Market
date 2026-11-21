"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AuthError, Session } from "@supabase/supabase-js";
import {
  Ban,
  BadgeCheck,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import {
  currentDecision,
  decisionStillApplies,
  whatsappLink,
  whatsappMessage,
  type ListingDecision,
} from "@/lib/listingMessages";
import { BROKEN_IMAGE, formatDate, formatPrice, slugify } from "@/lib/utils";
import type {
  BlogComment,
  BlogPost,
  Listing,
  LocalAd,
  NewsItem,
} from "@/types/database";

type Tab = "bidhaa" | "ads" | "blogu" | "maoni" | "habari";
type ListingFilter = "pending" | "approved" | "rejected" | "all";

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
  // Uamuzi wa mwisho aliofanya Afisa Masoko kwa kila tangazo (kwa kitufe cha WhatsApp)
  const [lastDecision, setLastDecision] = useState<
    Record<string, ListingDecision>
  >({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  const patch = async (
    id: string,
    values: Partial<Listing>,
    decision?: ListingDecision
  ) => {
    setNotice(null);
    const { error } = await supabase.from("listings").update(values).eq("id", id);
    if (error) {
      setNotice({ type: "err", text: error.message });
      return;
    }
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...values } : l)));
    if (decision) setLastDecision((prev) => ({ ...prev, [id]: decision }));
  };

  const confirmReject = async (l: Listing) => {
    const reason = rejectReason.trim().slice(0, 200);
    await patch(
      l.id,
      { status: "rejected", rejection_reason: reason || null },
      "rejected"
    );
    setRejectingId(null);
    setRejectReason("");
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
      : filter === "rejected"
      ? l.status === "rejected"
      : l.status !== "approved" && l.status !== "rejected"
  );
  const pendingCount = items.filter(
    (l) => l.status !== "approved" && l.status !== "rejected"
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", `Yanasubiri (${pendingCount})`],
            ["approved", "Yaliyopitishwa"],
            ["rejected", "Yaliyokataliwa"],
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
        visible.map((l) => {
          const last = lastDecision[l.id];
          const decision: ListingDecision | null =
            last && decisionStillApplies(l, last) ? last : currentDecision(l);
          const waText = decision
            ? whatsappMessage(decision, {
                sellerName: l.seller_name,
                title: l.title,
                reason: l.rejection_reason,
              })
            : null;
          const waHref =
            waText !== null ? whatsappLink(l.whatsapp_number, waText) : null;
          const decisionLabel: Record<ListingDecision, string> = {
            approved: "Imepitishwa",
            verified: "Verified",
            sponsored: "Sponsored",
            rejected: "Kataliwa",
          };

          return (
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
                  <h3 className="break-words text-sm font-bold text-slate-900">
                    {l.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      l.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : l.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {l.status === "approved"
                      ? "Imepitishwa"
                      : l.status === "rejected"
                      ? "Kataliwa"
                      : "Inasubiri"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {formatPrice(l.price)} · {l.category} · {l.campus_location}
                </p>
                <p className="text-xs text-slate-500">
                  {l.seller_name} · {l.whatsapp_number} · {formatDate(l.created_at)}
                </p>
                {l.status === "rejected" && l.rejection_reason && (
                  <p className="break-words text-xs text-red-600">
                    Sababu: {l.rejection_reason}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      l.status === "approved"
                        ? patch(l.id, { status: "pending" })
                        : patch(
                            l.id,
                            { status: "approved", rejection_reason: null },
                            "approved"
                          )
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
                    onClick={() =>
                      patch(
                        l.id,
                        { is_sponsored: !l.is_sponsored },
                        l.is_sponsored ? undefined : "sponsored"
                      )
                    }
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
                    onClick={() =>
                      patch(
                        l.id,
                        { is_verified: !l.is_verified },
                        l.is_verified ? undefined : "verified"
                      )
                    }
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold ${
                      l.is_verified
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 text-slate-700"
                    }`}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </button>
                  {l.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(rejectingId === l.id ? null : l.id);
                        setRejectReason("");
                      }}
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Kataa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(l)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Futa
                  </button>
                </div>

                {rejectingId === l.id && (
                  <div className="space-y-2 rounded-xl border border-red-100 bg-red-50 p-2">
                    <input
                      className={inputClass}
                      value={rejectReason}
                      maxLength={200}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Sababu fupi ya kukataa (hiari)"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void confirmReject(l)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                      >
                        Thibitisha Kukataa
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
                      >
                        Ghairi
                      </button>
                    </div>
                  </div>
                )}

                {decision && (
                  <div className="pt-1">
                    {waHref ? (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#059669] px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Tuma WhatsApp ({decisionLabel[decision]})
                      </a>
                    ) : (
                      <p className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                        ⚠️ Namba ya muuzaji ({l.whatsapp_number}) si sahihi,
                        kwa hiyo WhatsApp haiwezi kufunguliwa. Mwombe aihariri
                        kupitia &quot;Tangazo Langu&quot;.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
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

  const [editingId, setEditingId] = useState<string | null>(null);
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

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSlugEdited(false);
    setExcerpt("");
    setCategory("Maisha ya Chuo");
    setCoverImage("");
    setContent("");
  };

  const startEdit = (post: BlogPost) => {
    setNotice(null);
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setSlugEdited(true); // slug isibadilike yenyewe wakati wa kuhariri
    setExcerpt(post.excerpt ?? "");
    setCategory(post.category ?? "Maisha ya Chuo");
    setCoverImage(post.cover_image ?? "");
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTitle = (value: string) => {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNotice(null);
    const finalSlug = slugify(slug || title);
    if (title.trim().length < 3)
      return setNotice({ type: "err", text: "Weka kichwa cha makala." });
    if (!finalSlug)
      return setNotice({ type: "err", text: "Slug si sahihi." });
    if (content.trim().length < 20)
      return setNotice({ type: "err", text: "Andika maudhui ya makala." });

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      cover_image: coverImage.trim() || null,
      category: category.trim() || "Maisha ya Chuo",
    };

    setSaving(true);

    if (editingId) {
      const { data, error } = await supabase
        .from("blogs")
        .update(payload)
        .eq("id", editingId)
        .select()
        .maybeSingle();
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
      if (!data) {
        setNotice({
          type: "err",
          text: "Hakuna kilichohifadhiwa. Endesha SQL ya sera ya update (hatua A1) kisha ujaribu tena.",
        });
        return;
      }
      setPosts((prev) =>
        prev.map((p) => (p.id === editingId ? (data as BlogPost) : p))
      );
      resetForm();
      setNotice({ type: "ok", text: "Mabadiliko yamehifadhiwa." });
      return;
    }

    const { data, error } = await supabase
      .from("blogs")
      .insert(payload)
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
    resetForm();
    setNotice({ type: "ok", text: "Makala imechapishwa." });
  };

  const remove = async (post: BlogPost) => {
    if (!window.confirm(`Futa makala "${post.title}"?`)) return;
    const { error } = await supabase.from("blogs").delete().eq("id", post.id);
    if (error) return setNotice({ type: "err", text: error.message });
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    if (editingId === post.id) resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-slate-900">
            {editingId ? "Hariri Makala" : "Andika Makala Mpya"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Ghairi
            </button>
          )}
        </div>
        {editingId && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            Unahariri makala iliyopo. Ukibadilisha slug, link za zamani za
            makala hii zitaacha kufanya kazi.
          </p>
        )}
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
        <NewsImageField
          label="Picha ya jalada la makala (hiari)"
          folder="blogs"
          value={coverImage}
          onChange={setCoverImage}
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
          onClick={handleSave}
          disabled={saving}
          className={primaryBtn}
        >
          {saving
            ? editingId
              ? "Inahifadhi..."
              : "Inachapisha..."
            : editingId
            ? "Hifadhi Mabadiliko"
            : "Chapisha Makala"}
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
            className={`flex items-center justify-between gap-3 rounded-2xl border bg-white p-3 shadow-sm ${
              editingId === p.id
                ? "border-emerald-500 ring-2 ring-emerald-500/20"
                : "border-slate-200"
            }`}
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
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Hariri
              </button>
              <button
                type="button"
                onClick={() => remove(p)}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Futa
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* =========================== MAONI =========================== */
interface AdminComment {
  id: string;
  created_at: string;
  author_name: string;
  content: string;
  post_title: string;
  link: string | null;
}

type CommentSource = "blogu" | "habari";

function CommentsTab() {
  const [source, setSource] = useState<CommentSource>("blogu");
  const [items, setItems] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      if (source === "blogu") {
        const { data, error } = await supabase
          .from("comments")
          .select("id, created_at, author_name, content, blogs(title, slug)")
          .order("created_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          created_at: string;
          author_name: string;
          content: string;
          blogs:
            | { title: string; slug: string }
            | { title: string; slug: string }[]
            | null;
        }>;
        setItems(
          rows.map((r) => {
            const b = Array.isArray(r.blogs) ? r.blogs[0] : r.blogs;
            return {
              id: r.id,
              created_at: r.created_at,
              author_name: r.author_name,
              content: r.content,
              post_title: b?.title ?? "(makala imefutwa)",
              link: b?.slug ? `/blog/${b.slug}` : null,
            };
          })
        );
      } else {
        const { data, error } = await supabase
          .from("news_comments")
          .select("id, created_at, news_id, author_name, content, news(title)")
          .order("created_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          created_at: string;
          news_id: string | number;
          author_name: string;
          content: string;
          news: { title: string } | { title: string }[] | null;
        }>;
        setItems(
          rows.map((r) => {
            const n = Array.isArray(r.news) ? r.news[0] : r.news;
            return {
              id: r.id,
              created_at: r.created_at,
              author_name: r.author_name,
              content: r.content,
              post_title: n?.title ?? "(habari imefutwa)",
              link: n ? `/habari#news-${r.news_id}` : null,
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      setItems([]);
      setNotice({
        type: "err",
        text: `Imeshindwa kupakia maoni.${msg ? ` (${msg})` : ""}`,
      });
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (c: AdminComment) => {
    setBusyId(c.id);
    setNotice(null);
    try {
      const table = source === "blogu" ? "comments" : "news_comments";
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq("id", c.id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Hakuna safu iliyofutwa (angalia policy ya delete)");
      }
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      setNotice({ type: "ok", text: "Maoni yamefutwa." });
    } catch (err) {
      console.error(err);
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      setNotice({
        type: "err",
        text: `Imeshindwa kufuta maoni.${msg ? ` (${msg})` : ""}`,
      });
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(
          [
            ["blogu", "Maoni ya Blogu"],
            ["habari", "Maoni ya Habari"],
          ] as [CommentSource, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setSource(key);
              setConfirmId(null);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              source === key
                ? "border-emerald-600 bg-[#059669] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-extrabold text-slate-900">
          Maoni yote ({items.length})
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          Pakia Upya
        </button>
      </div>
      <Notice notice={notice} />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-[#059669]" />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Bado hakuna maoni.
        </p>
      ) : (
        items.map((c) => (
          <div
            key={c.id}
            className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="min-w-0 truncate font-bold text-slate-900">
                {c.author_name}
              </span>
              <span>{formatDate(c.created_at)}</span>
            </div>
            <p className="text-xs text-slate-500">
              {source === "blogu" ? "Makala" : "Habari"}:{" "}
              {c.link ? (
                <Link
                  href={c.link}
                  className="font-semibold text-emerald-700"
                >
                  {c.post_title}
                </Link>
              ) : (
                <span className="font-semibold">{c.post_title}</span>
              )}
            </p>
            <p className="whitespace-pre-line break-words text-sm text-slate-700">
              {c.content}
            </p>
            {confirmId === c.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-red-600">
                  Una uhakika?
                </span>
                <button
                  type="button"
                  onClick={() => void remove(c)}
                  disabled={busyId === c.id}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {busyId === c.id ? "Inafuta..." : "Ndiyo, futa"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hapana
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(c.id)}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Futa
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* =========================== HABARI =========================== */
function NewsImageField({
  value,
  onChange,
  label = "Picha ya habari (hiari)",
  folder = "news",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [value]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith("image/")) {
      return setErr("Chagua faili la picha tu.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return setErr("Picha ni kubwa kuliko MB 5. Chagua ndogo zaidi.");
    }
    setUploading(true);
    try {
          const url = await uploadImage(file, folder);
      onChange(url);
    } catch (error) {
      setErr(
        error instanceof Error ? error.message : "Imeshindwa kupakia picha."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
           <p className="text-sm font-semibold text-slate-900">{label}</p>

      {value.trim() && !broken && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <img
            src={value.trim()}
            alt="Hakikisho la picha"
            onError={() => setBroken(true)}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}
      {value.trim() && broken && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Picha hii haionekani. Angalia link au pakia picha nyingine.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Inapakia...
            </>
          ) : value.trim() ? (
            "Badilisha picha"
          ) : (
            "Pakia picha kutoka kwenye simu/kompyuta"
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            className="sr-only"
          />
        </label>
        {value.trim() && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
          >
            Ondoa picha
          </button>
        )}
      </div>

      <input
        className={inputClass}
        placeholder="Au weka link ya picha (https://...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-slate-500">
        Ukubwa wa juu: MB 5. Picha ya mlalo (16:9) inaonekana vizuri zaidi.
      </p>
      {err && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {err}
        </p>
      )}
    </div>
  );
}

function NewsTab() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [markNew, setMarkNew] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editImage, setEditImage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setNotice({ type: "err", text: error.message });
    else setItems((data ?? []) as NewsItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePublish = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNotice(null);
    if (title.trim().length < 3)
      return setNotice({ type: "err", text: "Weka kichwa cha habari." });
    if (body.trim().length < 5)
      return setNotice({ type: "err", text: "Andika maelezo ya habari." });

    setSaving(true);
    const { data, error } = await supabase
      .from("news")
      .insert({
        title: title.trim(),
        body: body.trim(),
        is_new: markNew,
        image_url: imageUrl.trim() || null,
      })
      .select()
      .single();
    setSaving(false);

    if (error)
      return setNotice({
        type: "err",
        text: error.message.includes("image_url")
          ? "Safu ya picha haipo. Endesha SQL ya 'alter table news add column image_url' kwanza."
          : error.message,
      });
    setItems((prev) => [data as NewsItem, ...prev]);
    setTitle("");
    setBody("");
    setImageUrl("");
    setMarkNew(true);
    setNotice({ type: "ok", text: "Habari imechapishwa." });
  };

  const setNewFlag = async (item: NewsItem, value: boolean) => {
    setNotice(null);
    const { error } = await supabase
      .from("news")
      .update({ is_new: value })
      .eq("id", item.id);
    if (error) return setNotice({ type: "err", text: error.message });
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_new: value } : n))
    );
  };

  const clearAllNew = async () => {
    if (!window.confirm("Ondoa alama ya MPYA kwenye habari zote?")) return;
    setNotice(null);
    const { error } = await supabase
      .from("news")
      .update({ is_new: false })
      .eq("is_new", true);
    if (error) return setNotice({ type: "err", text: error.message });
    setItems((prev) => prev.map((n) => ({ ...n, is_new: false })));
    setNotice({ type: "ok", text: "Alama ya MPYA imeondolewa kwa zote." });
  };

  const remove = async (item: NewsItem) => {
    if (!window.confirm(`Futa habari "${item.title}"?`)) return;
    const { error } = await supabase.from("news").delete().eq("id", item.id);
    if (error) return setNotice({ type: "err", text: error.message });
    setItems((prev) => prev.filter((n) => n.id !== item.id));
  };

  const startEdit = (item: NewsItem) => {
    setNotice(null);
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditBody(item.body);
    setEditImage(item.image_url ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
    setEditImage("");
  };

  const saveEdit = async (item: NewsItem) => {
    setNotice(null);
    if (editTitle.trim().length < 3)
      return setNotice({ type: "err", text: "Weka kichwa cha habari." });
    if (editBody.trim().length < 5)
      return setNotice({ type: "err", text: "Andika maelezo ya habari." });

    const nextImage = editImage.trim() || null;
    setSavingEdit(true);
    const { error } = await supabase
      .from("news")
      .update({
        title: editTitle.trim(),
        body: editBody.trim(),
        image_url: nextImage,
      })
      .eq("id", item.id);
    setSavingEdit(false);

    if (error) return setNotice({ type: "err", text: error.message });
    setItems((prev) =>
      prev.map((n) =>
        n.id === item.id
          ? {
              ...n,
              title: editTitle.trim(),
              body: editBody.trim(),
              image_url: nextImage,
            }
          : n
      )
    );
    cancelEdit();
    setNotice({ type: "ok", text: "Habari imehifadhiwa." });
  };

  const newCount = items.filter((n) => n.is_new).length;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900">
          Weka Habari Mpya
        </h3>
        <input
          className={inputClass}
          placeholder="Kichwa cha habari"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-[120px]`}
          placeholder="Maelezo ya habari"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <NewsImageField value={imageUrl} onChange={setImageUrl} />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={markNew}
            onChange={(e) => setMarkNew(e.target.checked)}
            className="h-4 w-4 accent-[#059669]"
          />
          Weka alama ya MPYA (taa inayowaka kwenye menyu)
        </label>
        <Notice notice={notice} />
        <button
          type="button"
          onClick={handlePublish}
          disabled={saving}
          className={primaryBtn}
        >
          {saving ? "Inachapisha..." : "Chapisha Habari"}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Habari zenye alama ya MPYA:{" "}
          <span className="font-extrabold text-amber-600">{newCount}</span>
        </p>
        {newCount > 0 && (
          <button
            type="button"
            onClick={clearAllNew}
            className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50"
          >
            Ondoa MPYA kwa zote
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-[#059669]" />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Bado hakuna habari. Chapisha ya kwanza hapo juu.
        </p>
      ) : (
        items.map((n) =>
          editingId === n.id ? (
            <div
              key={n.id}
              className="space-y-3 rounded-2xl border border-emerald-300 bg-white p-4 shadow-sm"
            >
              <h3 className="text-base font-extrabold text-slate-900">
                Hariri Habari
              </h3>
              <input
                className={inputClass}
                placeholder="Kichwa cha habari"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                className={`${inputClass} min-h-[120px]`}
                placeholder="Maelezo ya habari"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
              />
              <NewsImageField value={editImage} onChange={setEditImage} />
              <Notice notice={notice} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => saveEdit(n)}
                  disabled={savingEdit}
                  className={primaryBtn}
                >
                  {savingEdit ? "Inahifadhi..." : "Hifadhi"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={savingEdit}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  Ghairi
                </button>
              </div>
            </div>
          ) : (
            <div
              key={n.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {n.image_url && (
                  <img
                    src={n.image_url}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 truncate text-sm font-bold text-slate-900">
                    <span className="truncate">{n.title}</span>
                    {n.is_new && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-700">
                        Mpya
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formatDate(n.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => startEdit(n)}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Hariri
                </button>
                <button
                  type="button"
                  onClick={() => setNewFlag(n, !n.is_new)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    n.is_new
                      ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {n.is_new ? "Ondoa MPYA" : "Weka MPYA"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(n)}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Futa
                </button>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
/* =========================== ADMIN =========================== */
function authErrorMessage(error: AuthError): string {
  const msg = (error.message || "").toLowerCase();
  const code = (error as { code?: string }).code ?? "";
  if (
    error.status === 429 ||
    code === "over_request_rate_limit" ||
    msg.includes("rate limit")
  ) {
    return "Umejaribu mara nyingi sana. Subiri dakika chache kisha ujaribu tena.";
  }
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) {
    return "Barua pepe haijathibitishwa. Thibitisha akaunti kwenye Supabase.";
  }
  if (
    code === "invalid_credentials" ||
    msg.includes("invalid login") ||
    msg.includes("invalid credentials")
  ) {
    return "Barua pepe au nenosiri si sahihi.";
  }
  if (msg.includes("fetch") || msg.includes("network")) {
    return "Hakuna mtandao au Supabase haipatikani. Jaribu tena.";
  }
  return "Imeshindwa kuingia. Jaribu tena.";
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("bidhaa");

  // Kagua session iliyopo + sikiliza kuingia/kutoka (pamoja na session kuisha)
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active) setSession(data.session);
      } catch {
        if (active) setSession(null);
      } finally {
        if (active) setChecked(true);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) return;
        setSession(nextSession);
        setChecked(true);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (signingIn) return;
    setLoginError(null);

    if (!isSupabaseConfigured) {
      return setLoginError(
        "Supabase haijaunganishwa. Angalia NEXT_PUBLIC_SUPABASE_URL na NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }
    if (!email.trim() || !password) {
      return setLoginError("Weka barua pepe na nenosiri.");
    }

    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSigningIn(false);

    if (error) return setLoginError(authErrorMessage(error));
    setPassword("");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPassword("");
    setShowPassword(false);
  };

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#059669]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#059669] text-white">
              <Lock className="h-6 w-6" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Afisa Masoko wa Mwanachuo Market
            </h1>
            <p className="text-sm text-slate-500">
              Ingia kwa barua pepe na nenosiri lako.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-900">
              Barua pepe
            </span>
            <input
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLoginError(null);
              }}
              placeholder="jina@mfano.com"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-900">
              Nenosiri
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(null);
                }}
                placeholder="Nenosiri"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ficha nenosiri" : "Onyesha nenosiri"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          {loginError && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={signingIn}
            className={`${primaryBtn} flex w-full items-center justify-center gap-2`}
          >
            {signingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Inaingia...
              </>
            ) : (
              "Ingia"
            )}
          </button>
          <Link
            href="/"
            className="block text-center text-sm font-semibold text-emerald-700"
          >
            ← Rudi Sokoni
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-extrabold text-slate-900">
            Afisa Masoko
            <span className="hidden text-[#059669] sm:inline"> Dashboard</span>
          </h1>
          <div className="flex items-center gap-3">
            {session.user.email && (
              <span className="hidden max-w-[180px] truncate text-xs text-slate-500 md:block">
                {session.user.email}
              </span>
            )}
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
        <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto px-4 pb-3">
          {(
            [
              ["bidhaa", "Bidhaa"],
              ["ads", "Local Ads"],
              ["blogu", "Blogu"],
              ["maoni", "Maoni"],
              ["habari", "Habari"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold ${
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
        {tab === "maoni" && <CommentsTab />}
        {tab === "habari" && <NewsTab />}
      </main>
    </div>
  );
}
