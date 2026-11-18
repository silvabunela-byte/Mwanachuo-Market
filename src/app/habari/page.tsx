"use client";

import { useEffect, useState } from "react";
import { Loader2, Newspaper, Star } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types/database";
import Navbar from "@/components/Navbar";

function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-700">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
      </span>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
      Mpya
    </span>
  );
}

export default function HabariPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <header>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Habari za Mwanachuo Market
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Taarifa mpya, matangazo na mabadiliko muhimu.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#059669]" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-14 text-center shadow-sm">
            <Newspaper className="mx-auto mb-2 h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-500">Bado hakuna habari.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => (
              <article
                key={item.id}
                style={{ animationDelay: `${Math.min(i, 6) * 100}ms` }}
                className={`animate-fade-up rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  item.is_new
                    ? "border-amber-300 ring-2 ring-amber-100"
                    : "border-slate-200"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    {formatDate(item.created_at)}
                  </span>
                  {item.is_new && <NewBadge />}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {item.title}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
