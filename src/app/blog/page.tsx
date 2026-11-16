"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Blog } from "@/lib/types";
import SetupNotice from "@/components/SetupNotice";

export default function BlogPage() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) return setLoading(false);
    supabase
      .from("blogs")
      .select("id,created_at,title,slug,excerpt,cover_image,category,content")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as Blog[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <SetupNotice />
      <h1 className="font-display text-4xl font-bold">Blogu ya Mwanachuo</h1>
      <p className="mb-8 mt-1 text-emerald-950/70">Maisha ya chuo, fedha, masomo na mbinu za kununua na kuuza salama.</p>
      {loading ? (
        <p>Inapakia...</p>
      ) : posts.length === 0 ? (
        <div className="card p-10 text-center text-emerald-950/60">Hakuna makala bado.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className={`card group overflow-hidden transition hover:shadow-[6px_6px_0_#064e3b] ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              {p.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_image} alt="" className={`w-full object-cover ${i === 0 ? "aspect-[16/9]" : "aspect-[16/10]"}`} />
              )}
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  {p.category} · {new Date(p.created_at).toLocaleDateString("sw-TZ")}
                </p>
                <h2 className={`mt-1 font-display font-bold group-hover:underline ${i === 0 ? "text-3xl" : "text-xl"}`}>{p.title}</h2>
                {p.excerpt && <p className="mt-2 text-sm text-emerald-950/70">{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
