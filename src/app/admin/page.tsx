"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
import { supabase } from "@/lib/supabase";
import { ADMIN_PIN } from "@/lib/config";
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


/* =========================== MAONI =========================== */
interface AdminComment extends BlogComment {
  post_title: string;
  post_slug: string | null;
}

function CommentsTab() {
  const [items, setItems] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("id, created_at, post_id, author_name, content, blogs(title, slug)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const rows = (data ?? []) as unknown as Array<
        BlogComment & {
          blogs:
            | { title: string; slug: string }
            | { title: string; slug: string }[]
            | null;
        }
      >;
      setItems(
        rows.map((r) => {
          const b = Array.isArray(r.blogs) ? r.blogs[0] : r.blogs;
          return {
            id: r.id,
            created_at: r.created_at,
            post_id: r.post_id,
            author_name: r.author_name,
            content: r.content,
            post_title: b?.title ?? "(makala imefutwa)",
            post_slug: b?.slug ?? null,
          };
        })
      );
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Imeshindwa kupakia maoni." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (c: AdminComment) => {
    setBusyId(c.id);
    setNotice(null);
    try {
      const { data, error } = await supabase
        .from("comments")
        .delete()
        .eq("id", c.id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Hakuna safu iliyofutwa (angalia policy ya delete).");
      }
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      setNotice({ type: "ok", text: "Maoni yamefutwa." });
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Imeshindwa kufuta maoni." });
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-3">
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
              Makala:{" "}
              {c.post_slug ? (
                <Link
                  href={`/blog/${c.post_slug}`}
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
function NewsTab() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [markNew, setMarkNew] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
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
      .insert({ title: title.trim(), body: body.trim(), is_new: markNew })
      .select()
      .single();
    setSaving(false);

    if (error) return setNotice({ type: "err", text: error.message });
    setItems((prev) => [data as NewsItem, ...prev]);
    setTitle("");
    setBody("");
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
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  };

  const saveEdit = async (item: NewsItem) => {
    setNotice(null);
    if (editTitle.trim().length < 3)
      return setNotice({ type: "err", text: "Weka kichwa cha habari." });
    if (editBody.trim().length < 5)
      return setNotice({ type: "err", text: "Andika maelezo ya habari." });

    setSavingEdit(true);
    const { error } = await supabase
      .from("news")
      .update({ title: editTitle.trim(), body: editBody.trim() })
      .eq("id", item.id);
    setSavingEdit(false);

    if (error) return setNotice({ type: "err", text: error.message });
    setItems((prev) =>
      prev.map((n) =>
        n.id === item.id
          ? { ...n, title: editTitle.trim(), body: editBody.trim() }
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
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 truncate text-sm font-bold text-slate-900">
                {n.title}
                {n.is_new && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-700">
                    Mpya
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">{formatDate(n.created_at)}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
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
              Afisa Masoko wa Mwanachuo Market
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
            Afisa Masoko
            <span className="hidden text-[#059669] sm:inline"> Dashboard</span>
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
