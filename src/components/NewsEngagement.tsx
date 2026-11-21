"use client";
import {
  Check,
  Copy,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useIsAdmin } from "@/lib/useIsAdmin";
import { timeAgo } from "@/lib/utils";

const LIKES_KEY = "mm_liked_news";
const NAME_KEY = "mm_comment_name";
const NAME_MAX = 40;
const COMMENT_MAX = 500;
const COOLDOWN_SECONDS = 15;

interface NewsComment {
  id: string;
  created_at: string;
  news_id: string | number;
  author_name: string;
  content: string;
}

function readLikedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(LIKES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function writeLikedIds(ids: string[]): void {
  try {
    window.localStorage.setItem(LIKES_KEY, JSON.stringify(ids));
  } catch {
    /* puuza */
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function errMessage(err: unknown): string {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message: unknown }).message)
    : "";
}

export default function NewsEngagement({
  newsId,
  title,
  initialLikes,
  initialComments,
}: {
  newsId: string;
  title: string;
  initialLikes: number;
  initialComments: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialComments);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
    const isAdmin = useIsAdmin();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    if (!loaded) setCount(initialComments);
  }, [initialComments, loaded]);

  useEffect(() => {
    setLiked(readLikedIds().includes(String(newsId)));
  }, [newsId]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NAME_KEY);
      if (saved) setName(saved.slice(0, NAME_MAX));
    } catch {
      /* puuza */
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  /* ---------------- LIKE ---------------- */
  const toggleLike = async () => {
    if (busy) return;
    setBusy(true);
    const id = String(newsId);
    const next = !liked;
    setLiked(next);
    setLikes((l) => Math.max(0, l + (next ? 1 : -1)));

    const ids = readLikedIds().filter((x) => x !== id);
    if (next) ids.push(id);
    writeLikedIds(ids);

    try {
      const { data, error: err } = await supabase.rpc(
        next ? "like_news" : "unlike_news",
        { p_news_id: id }
      );
      if (err) throw err;
      if (typeof data === "number") setLikes(data);
    } catch (err) {
      console.error(err);
      setLiked(!next);
      setLikes((l) => Math.max(0, l + (next ? -1 : 1)));
      const back = readLikedIds().filter((x) => x !== id);
      if (!next) back.push(id);
      writeLikedIds(back);
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- SHARE ---------------- */
  const shareUrl = () =>
    `${window.location.origin}/habari#news-${String(newsId)}`;

  const handleShare = async () => {
    const url = shareUrl();
    if ("share" in navigator) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    setShareOpen((o) => !o);
  };

  const handleCopy = async () => {
    const ok = await copyText(shareUrl());
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const msg = `${title}\n${shareUrl()}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ---------------- MAONI ---------------- */
  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("news_comments")
        .select("id, created_at, news_id, author_name, content")
        .eq("news_id", newsId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (err) throw err;
      const rows = (data ?? []) as NewsComment[];
      setComments(rows);
      if (rows.length < 100) setCount(rows.length);
      setLoadError(null);
      setLoaded(true);
    } catch (err) {
      console.error(err);
      setLoadError(errMessage(err) || "Hitilafu isiyojulikana");
    } finally {
      setLoading(false);
    }
  }, [newsId]);

  const toggleComments = () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) void loadComments();
  };

  const submit = async () => {
    if (sending || cooldown > 0) return;
    const cleanName = name.trim();
    const cleanText = text.trim();
    if (!cleanName) {
      setError("Tafadhali andika jina lako.");
      return;
    }
    if (!cleanText) {
      setError("Maoni hayawezi kuwa matupu.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const { data, error: err } = await supabase
        .from("news_comments")
        .insert({
          news_id: newsId,
          author_name: cleanName,
          content: cleanText,
        })
        .select("id, created_at, news_id, author_name, content")
        .single();
      if (err) throw err;
      setComments((prev) => [data as NewsComment, ...prev]);
      setCount((c) => c + 1);
      setText("");
      setCooldown(COOLDOWN_SECONDS);
      try {
        window.localStorage.setItem(NAME_KEY, cleanName);
      } catch {
        /* puuza */
      }
    } catch (err) {
      console.error(err);
      const msg = errMessage(err);
      if (msg.includes("COOLDOWN")) {
        setError("Subiri sekunde chache kabla ya kutuma maoni mengine.");
        setCooldown(COOLDOWN_SECONDS);
      } else if (msg.includes("FLOOD")) {
        setError("Maoni mengi yanatumwa sasa hivi. Jaribu tena baadaye kidogo.");
      } else {
        setError(
          `Imeshindwa kutuma maoni. Jaribu tena.${msg ? ` (${msg})` : ""}`
        );
      }
    } finally {
      setSending(false);
    }
  };

    const removeComment = async (c: NewsComment) => {
    if (!window.confirm("Futa maoni haya?")) return;
    setDeletingId(c.id);
    try {
      const { data, error: err } = await supabase
        .from("news_comments")
        .delete()
        .eq("id", c.id)
        .select("id");
      if (err) throw err;
      if (!data || data.length === 0) {
        throw new Error("Hakuna safu iliyofutwa (angalia policy ya delete)");
      }
      setComments((prev) => prev.filter((x) => x.id !== c.id));
      setCount((n) => Math.max(0, n - 1));
    } catch (err) {
      console.error(err);
      const msg = errMessage(err);
      setError(`Imeshindwa kufuta maoni.${msg ? ` (${msg})` : ""}`);
    } finally {
      setDeletingId(null);
    }
  };
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20";

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleLike}
          disabled={busy}
          aria-pressed={liked}
          aria-label={liked ? "Ondoa like" : "Penda habari hii"}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition active:scale-95 ${
            liked
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition ${
              liked ? "fill-red-500 text-red-500" : ""
            }`}
          />
          <span>{likes}</span>
        </button>

        <button
          type="button"
          onClick={toggleComments}
          aria-expanded={open}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition active:scale-95 ${
            open
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Maoni ({count})</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 rounded-full bg-[#059669] px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          <Share2 className="h-4 w-4" />
          Shirikisha
        </button>
      </div>

      {shareOpen && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Imenakiliwa!" : "Nakili Link"}
          </button>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex items-center gap-1.5 rounded-lg bg-[#059669] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </button>
        </div>
      )}

      {open && (
        <div className="space-y-3 rounded-xl bg-slate-50 p-3">
          <div className="space-y-2">
            <input
              type="text"
              className={inputClass}
              placeholder="Jina lako"
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="Andika maoni yako..."
              value={text}
              maxLength={COMMENT_MAX}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {text.length}/{COMMENT_MAX}
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={sending || cooldown > 0}
                className="flex items-center gap-2 rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {cooldown > 0 ? `Subiri ${cooldown}s` : "Tuma Maoni"}
              </button>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          {loadError && (
            <p
              role="alert"
              className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
            >
              Maoni hayakupakia: {loadError}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#059669]" />
            </div>
          ) : comments.length === 0 && !loadError ? (
            <p className="text-center text-sm text-slate-500">
              Bado hakuna maoni. Kuwa wa kwanza!
            </p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl bg-white p-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate font-bold text-slate-900">
                      {c.author_name}
                    </span>
                    <span className="shrink-0 text-slate-500">
                      {timeAgo(c.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-700">
                    {c.content}
                  </p>
                                    {isAdmin && (
                    <button
                      type="button"
                      onClick={() => void removeComment(c)}
                      disabled={deletingId === c.id}
                      className="mt-2 flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === c.id ? "Inafuta..." : "Futa (Admin)"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
