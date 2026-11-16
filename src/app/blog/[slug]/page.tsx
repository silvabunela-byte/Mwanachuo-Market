"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Blog } from "@/lib/types";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured || !slug) return setLoading(false);
    supabase
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as Blog | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <p>Inapakia...</p>;
  if (!post)
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl font-bold">Makala haikupatikana.</p>
        <Link href="/blog" className="btn-primary mt-4">Rudi Blogu</Link>
      </div>
    );

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-800">
        <ArrowLeft size={16} /> Blogu
      </Link>
      <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
        {post.category} · {new Date(post.created_at).toLocaleDateString("sw-TZ")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold leading-tight md:text-5xl">{post.title}</h1>
      {post.excerpt && <p className="mt-3 text-lg text-emerald-950/70">{post.excerpt}</p>}
      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image} alt="" className="my-6 w-full rounded-2xl object-cover" />
      )}
      <div className="mt-6 space-y-4 text-lg leading-relaxed">
        {post.content.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="whitespace-pre-line">{para}</p>
        ))}
      </div>
    </article>
  );
}
