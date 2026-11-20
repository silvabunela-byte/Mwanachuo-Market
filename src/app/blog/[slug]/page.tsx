"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MOCK_BLOGS } from "@/lib/mockBlogs";
import { openAd, trackAdClick } from "@/lib/ads";
import { formatDate } from "@/lib/utils";
import type { BlogPost, LocalAd } from "@/types/database";
import Navbar from "@/components/Navbar";
import { AdBanner, HouseAd } from "@/components/AdBanner";
import BlogCover from "@/components/BlogCover";
import { CommentsSection, LikeShareBar } from "@/components/BlogEngagement";

/** Maudhui: aya zimetenganishwa na mstari mtupu; mstari unaoanza na "## " ni kichwa kidogo. */
function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="mt-6 text-lg font-extrabold text-slate-900"
          >
            {block.slice(3)}
          </h2>
        );
      }
      return (
        <p key={i} className="whitespace-pre-line leading-relaxed text-slate-700">
          {block}
        </p>
      );
    });
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(
    Array.isArray(params?.slug) ? params.slug[0] : params?.slug ?? ""
  );

  const [post, setPost] = useState<BlogPost | null>(null);
  const [ad, setAd] = useState<LocalAd | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      let found: BlogPost | null = null;
      try {
        const res = await supabase
          .from("blogs")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (!res.error && res.data) found = res.data as BlogPost;
      } catch (err) {
        console.error(err);
      }
      if (!found) {
        found = MOCK_BLOGS.find((b) => b.slug === slug) ?? null;
      }

      let foundAd: LocalAd | null = null;
      try {
        const adRes = await supabase
          .from("local_ads")
          .select("*")
          .eq("is_active", true)
          .eq("placement", "feed_banner")
          .order("created_at", { ascending: false })
          .limit(1);
        if (!adRes.error && adRes.data && adRes.data.length > 0) {
          foundAd = adRes.data[0] as LocalAd;
        }
      } catch (err) {
        console.error(err);
      }

      if (cancelled) return;
      setPost(found);
      setAd(foundAd);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const isMock = post ? post.id.startsWith("mock-") : false;

  const handleAdClick = (a: LocalAd) => {
    openAd(a);
    void trackAdClick(a);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Rudi kwenye Blogu
        </Link>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#059669]" />
          </div>
        ) : !post ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <h1 className="text-lg font-bold text-slate-900">
              Makala haijapatikana
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Huenda imefutwa au kiungo si sahihi.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-block rounded-full bg-[#059669] px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Tazama Makala Zote
            </Link>
          </div>
        ) : (
          <>
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-3 pb-0">
                <div className="overflow-hidden rounded-xl">
                  <BlogCover
                    title={post.title}
                    src={post.cover_image}
                    large
                  />
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                    {post.category || "Maisha ya Chuo"}
                  </span>
                  <span className="text-slate-500">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <h1 className="break-words text-2xl font-extrabold leading-snug text-slate-900">
                  {post.title}
                </h1>
                <div className="space-y-4 break-words">
                  {renderContent(post.content)}
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <LikeShareBar
                    postId={post.id}
                    title={post.title}
                    initialLikes={post.likes_count ?? 0}
                    canLike={!isMock}
                  />
                </div>
              </div>
            </article>

            {!isMock && <CommentsSection postId={post.id} />}
          </>
        )}

        {!loading && (
          <section aria-label="Tangazo">
            {ad ? <AdBanner ad={ad} onClick={handleAdClick} /> : <HouseAd />}
          </section>
        )}
      </main>
    </div>
  );
}
