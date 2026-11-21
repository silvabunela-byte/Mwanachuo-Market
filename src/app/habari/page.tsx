"use client";

import { useEffect, useState } from "react";
import { Newspaper, Star } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatDate, timeAgo } from "@/lib/utils";
import type { NewsItem } from "@/types/database";
import Navbar from "@/components/Navbar";
import NewsEngagement from "@/components/NewsEngagement";

type Filter = "zote" | "mpya";

const LONG_TEXT = 160;

function BlinkDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2.5 w-2.5 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
    </span>
  );
}

function NewBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-700">
      <BlinkDot />
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
      Mpya
    </span>
  );
}

function NewsImage({ src, title }: { src: string | null; title: string }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  // Hakuna picha (au imeshindwa kupakia): usionyeshe nafasi tupu
  if (!src || broken) return null;

  return (
    <div className="mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
      <img
        src={src}
        alt={title}
        loading="lazy"
        onError={() => setBroken(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function NewsCard({
  item,
  index,
  commentCount,
}: {
  item: NewsItem;
  index: number;
  commentCount: number;
}) {
const [expanded, setExpanded] = useState(false);
  const isLong = item.body.length > LONG_TEXT;

  return (
      <article
      id={`news-${item.id}`}
      style={{ animationDelay: `${Math.min(index, 6) * 100}ms` }}
      className={`animate-fade-up scroll-mt-20 relative overflow-hidden rounded-2xl border bg-white p-5 pl-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
        item.is_new
          ? "border-amber-300 ring-2 ring-amber-100"
          : "border-slate-200"
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1.5 ${
          item.is_new ? "bg-amber-400" : "bg-emerald-500"
        }`}
      />

      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          {formatDate(item.created_at)} · {timeAgo(item.created_at)}
        </span>
        {item.is_new && <NewBadge />}
      </div>

      <h2 className="text-lg font-extrabold leading-snug text-slate-900">
        {item.title}
      </h2>

      <NewsImage src={item.image_url} title={item.title} />

      <p
        className={`mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {item.body}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-bold text-[#059669] hover:text-emerald-700"
        >
          {expanded ? "Punguza ↑" : "Soma zaidi ↓"}
        </button>
      )}
              <NewsEngagement
        newsId={String(item.id)}
        title={item.title}
        initialLikes={item.likes_count ?? 0}
        initialComments={commentCount}
      />
    </article>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="h-3 w-1/4 rounded bg-slate-200" />
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-5/6 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function HabariPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("zote");
    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

    useEffect(() => {
    let cancelled = false;
    (async () => {
      let data: NewsItem[] = [];
      if (isSupabaseConfigured) {
        try {
          const res = await supabase
            .from("news")
            .select("*")
            .order("created_at", { ascending: false });
          if (!res.error) data = (res.data ?? []) as NewsItem[];
          else console.error(res.error);
        } catch (err) {
          console.error(err);
        }
      }
      if (cancelled) return;
      setItems(data);
      setLoading(false);

      if (data.length > 0) {
        try {
          const res = await supabase
            .from("news_comments")
            .select("news_id")
            .limit(5000);
          if (!res.error && !cancelled) {
            const counts: Record<string, number> = {};
            for (const r of (res.data ?? []) as { news_id: string | number }[]) {
              const k = String(r.news_id);
              counts[k] = (counts[k] ?? 0) + 1;
            }
            setCommentCounts(counts);
          }
        } catch (err) {
          console.error(err);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Link iliyoshirikiwa (#news-...) ielekeze moja kwa moja kwenye habari husika
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash;
    if (!hash.startsWith("#news-")) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading]);
  

  const newCount = items.filter((n) => n.is_new).length;
  const visible = filter === "mpya" ? items.filter((n) => n.is_new) : items;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <header className="rounded-3xl bg-gradient-to-br from-[#059669] to-emerald-700 p-6 text-white shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Newspaper className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold">
                Habari za Mwanachuo Market
              </h1>
              <p className="mt-0.5 text-sm text-emerald-50">
                Taarifa mpya, matangazo na mabadiliko muhimu.
              </p>
            </div>
          </div>

          {!loading && newCount > 0 && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
              <BlinkDot />
              Kuna habari {newCount} mpya
            </p>
          )}
        </header>

        {!loading && items.length > 0 && (
          <div className="flex gap-2">
            {(
              [
                ["zote", `Zote (${items.length})`],
                ["mpya", `Mpya (${newCount})`],
              ] as [Filter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  filter === key
                    ? "border-emerald-600 bg-[#059669] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Skeleton />
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-14 text-center shadow-sm">
            <Newspaper className="mx-auto mb-2 h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-500">
              {filter === "mpya"
                ? "Hakuna habari mpya kwa sasa."
                : "Bado hakuna habari."}
            </p>
          </div>
        ) : (
          <div key={filter} className="space-y-4">
            {visible.map((item, i) => (
                            <NewsCard
                key={item.id}
                item={item}
                index={i}
                commentCount={commentCounts[String(item.id)] ?? 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
