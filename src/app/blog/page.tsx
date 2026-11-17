"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MOCK_BLOGS } from "@/lib/mockBlogs";
import { BROKEN_IMAGE, formatDate, placeholderImage } from "@/lib/utils";
import type { BlogPost } from "@/types/database";
import Navbar from "@/components/Navbar";

function BlogCard({ post }: { post: BlogPost }) {
  const [broken, setBroken] = useState(false);
  const cover = broken
    ? BROKEN_IMAGE
    : post.cover_image || placeholderImage(post.title.slice(0, 22), "#059669");

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={cover}
          alt={post.title}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
            {post.category || "Maisha ya Chuo"}
          </span>
          <span className="text-slate-500">{formatDate(post.created_at)}</span>
        </div>
        <h2 className="text-lg font-extrabold leading-snug text-slate-900">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="line-clamp-3 text-sm text-slate-500">{post.excerpt}</p>
        )}
        <span className="mt-auto pt-2 text-sm font-bold text-[#059669]">
          Soma zaidi →
        </span>
      </div>
    </Link>
  );
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let data: BlogPost[] = [];
      try {
        const res = await supabase
          .from("blogs")
          .select("*")
          .order("created_at", { ascending: false });
        if (!res.error) data = (res.data ?? []) as BlogPost[];
        else console.error(res.error);
      } catch (err) {
        console.error(err);
      }
      if (cancelled) return;
      setPosts(data.length > 0 ? data : MOCK_BLOGS);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <header>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Blogu ya Wanachuo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vidokezo vya biashara, masomo, ajira na maisha ya chuo.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#059669]" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
