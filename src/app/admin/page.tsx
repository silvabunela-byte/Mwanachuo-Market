"use client";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Check, Eye, EyeOff, Lock, Star, Trash2, X } from "lucide-react";
import { supabase, IMAGE_BUCKET } from "@/lib/supabase";
import { ADMIN_PIN, formatTSh } from "@/lib/config";
import type { Blog, Listing, LocalAd } from "@/lib/types";
import SetupNotice from "@/components/SetupNotice";

type Tab = "bidhaa" | "matangazo" | "blogu";

async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file);
  if (error) throw error;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [tab, setTab] = useState<Tab>("bidhaa");

  useEffect(() => {
    if (sessionStorage.getItem("mm_admin") === "1") setAuthed(true);
  }, []);

  if (!authed)
    return (
      <form
        className="card mx-auto mt-10 max-w-sm p-8 text-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (pin === ADMIN_PIN) {
            sessionStorage.setItem("mm_admin", "1");
            setAuthed(true);
          } else setPinErr(true);
        }}
      >
        <Lock className="mx-auto text-emerald-800" />
        <h1 className="mt-2 font-display text-2xl font-bold">Admin</h1>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setPinErr(false);
          }}
          placeholder="PIN"
          className="input mt-4 text-center text-2xl tracking-[0.5em]"
        />
        {pinErr && <p className="mt-2 text-sm text-red-700">PIN si sahihi.</p>}
        <button className="btn-primary mt-4 w-full">Ingia</button>
      </form>
    );

  return (
    <>
      <SetupNotice />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold">Admin Panel</h1>
        <button
          className="btn-ghost"
          onClick={() => {
            sessionStorage.removeItem("mm_admin");
            setAuthed(false);
            setPin("");
          }}
        >
          Toka
        </button>
      </div>
      <div className="mb-6 flex gap-2">
        {(["bidhaa", "matangazo", "blogu"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold capitalize ${
              tab === t ? "border-emerald-900 bg-emerald-900 text-amber-50" : "border-emerald-900/15"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "bidhaa" && <ListingsAdmin />}
      {tab === "matangazo" && <AdsAdmin />}
      {tab === "blogu" && <BlogAdmin />}
    </>
  );
}

function ListingsAdmin() {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState<Listing[]>([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("listings").select("*").eq("status", status).order("created_at", { ascending: false });
    if (error) setMsg(error.message);
    setItems((data as Listing[]) || []);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, patch: Partial<Listing>) => {
    const { error } = await supabase.from("listings").update(patch).eq("id", id);
    if (error) setMsg(error.message);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Futa bidhaa hii?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) setMsg(error.message);
    load();
  };

  return (
    <div>
      <div className="mb-4 flex gap-2 text-sm">
        {[
          ["pending", "Zinasubiri"],
          ["approved", "Zimekubaliwa"],
          ["rejected", "Zimekataliwa"],
        ].map(([v, l]) => (
          <button key={v} onClick={() => setStatus(v)} className={`rounded-lg px-3 py-1 font-bold ${status === v ? "bg-amber-400" : "bg-white"}`}>
            {l}
          </button>
        ))}
      </div>
      {msg && <p className="mb-3 rounded-lg bg-red-100 p-3 text-sm text-red-800">{msg}</p>}
      {items.length === 0 && <p className="card p-6 text-center text-emerald-950/60">Hakuna bidhaa hapa.</p>}
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
            {i.image_urls?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.image_urls[0]} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="h-24 w-24 shrink-0 rounded-lg bg-emerald-900/5" />
            )}
            <div className="flex-1 text-sm">
              <p className="font-bold">
                {i.title} — {formatTSh(i.price)}
              </p>
              <p className="text-emerald-950/60">
                {i.category} · {i.condition} · {i.campus_location}
              </p>
              <p className="text-emerald-950/60">
                {i.seller_name} · +{i.whatsapp_number} · {new Date(i.created_at).toLocaleString("sw-TZ")}
              </p>
              {i.description && <p className="mt-1 line-clamp-2">{i.description}</p>}
            </div>
            <div className="flex flex-wrap items-start gap-2">
              {status !== "approved" && (
                <button onClick={() => update(i.id, { status: "approved" })} className="btn-primary !px-3 !py-1.5">
                  <Check size={14} /> Kubali
                </button>
              )}
              {status !== "rejected" && (
                <button onClick={() => update(i.id, { status: "rejected" })} className="btn-ghost !px-3 !py-1.5">
                  <X size={14} /> Kataa
                </button>
              )}
              <button
                onClick={() => update(i.id, { is_verified: !i.is_verified })}
                className={`btn !px-3 !py-1.5 ${i.is_verified ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-900"}`}
              >
                <BadgeCheck size={14} /> {i.is_verified ? "Verified" : "Verify"}
              </button>
              <button
                onClick={() => update(i.id, { is_sponsored: !i.is_sponsored })}
                className={`btn !px-3 !py-1.5 ${i.is_sponsored ? "bg-amber-400 text-emerald-950" : "bg-amber-100 text-amber-900"}`}
              >
                <Star size={14} /> {i.is_sponsored ? "Sponsored" : "Sponsor"}
              </button>
              <button onClick={() => remove(i.id)} className="btn !px-3 !py-1.5 bg-red-100 text-red-800">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdsAdmin() {
  const [ads, setAds] = useState<LocalAd[]>([]);
  const [form, setForm] = useState({ business_name: "", banner_url: "", target_url: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.from("local_ads").select("*").order("created_at", { ascending: false });
    setAds((data as LocalAd[]) || []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      const banner_url = file ? await uploadImage(file, "ads") : form.banner_url;
      if (!banner_url) throw new Error("Weka picha ya bango au URL.");
      const { error } = await supabase.from("local_ads").insert({ ...form, banner_url, placement: "top_banner", is_active: true });
      if (error) throw error;
      setForm({ business_name: "", banner_url: "", target_url: "" });
      setFile(null);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
      <form onSubmit={add} className="card space-y-3 self-start p-5">
        <h2 className="font-display text-xl font-bold">Bango jipya</h2>
        <div>
          <label className="label">Jina la biashara</label>
          <input required className="input" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
        </div>
        <div>
          <label className="label">Kiungo (URL / WhatsApp)</label>
          <input required type="url" className="input" value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Picha ya bango</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          <input className="input mt-2" value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} placeholder="au weka URL ya picha" />
        </div>
        {msg && <p className="rounded-lg bg-red-100 p-2 text-sm text-red-800">{msg}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? "Inahifadhi..." : "Ongeza Bango"}</button>
      </form>
      <div className="space-y-3">
        {ads.length === 0 && <p className="card p-6 text-center text-emerald-950/60">Hakuna mabango.</p>}
        {ads.map((a) => (
          <div key={a.id} className={`card overflow-hidden ${a.is_active ? "" : "opacity-60"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.banner_url} alt="" className="h-24 w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-3 text-sm">
              <div>
                <p className="font-bold">{a.business_name}</p>
                <p className="text-emerald-950/60">{a.clicks_count || 0} mabonyezo</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await supabase.from("local_ads").update({ is_active: !a.is_active }).eq("id", a.id);
                    load();
                  }}
                  className="btn-ghost !px-3 !py-1.5"
                >
                  {a.is_active ? <EyeOff size={14} /> : <Eye size={14} />} {a.is_active ? "Zima" : "Washa"}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Futa bango hili?")) return;
                    await supabase.from("local_ads").delete().eq("id", a.id);
                    load();
                  }}
                  className="btn !px-3 !py-1.5 bg-red-100 text-red-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

function BlogAdmin() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", cover_image: "", category: "Maisha ya Chuo" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    setPosts((data as Blog[]) || []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      const cover_image = file ? await uploadImage(file, "blog") : form.cover_image || null;
      const slug = `${slugify(form.title) || "makala"}-${Date.now().toString(36)}`;
      const { error } = await supabase.from("blogs").insert({ ...form, cover_image, slug });
      if (error) throw error;
      setForm({ title: "", excerpt: "", content: "", cover_image: "", category: "Maisha ya Chuo" });
      setFile(null);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
      <form onSubmit={add} className="card space-y-3 p-5">
        <h2 className="font-display text-xl font-bold">Makala mpya</h2>
        <div>
          <label className="label">Kichwa</label>
          <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Kundi</label>
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label className="label">Picha ya juu</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>
        <div>
          <label className="label">Muhtasari</label>
          <input className="input" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </div>
        <div>
          <label className="label">Maudhui</label>
          <textarea required rows={10} className="input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Tenganisha aya kwa mstari mtupu." />
        </div>
        {msg && <p className="rounded-lg bg-red-100 p-2 text-sm text-red-800">{msg}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? "Inachapisha..." : "Chapisha"}</button>
      </form>
      <div className="space-y-2">
        {posts.length === 0 && <p className="card p-6 text-center text-emerald-950/60">Hakuna makala.</p>}
        {posts.map((p) => (
          <div key={p.id} className="card flex items-center justify-between gap-2 p-3 text-sm">
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-emerald-950/60">{new Date(p.created_at).toLocaleDateString("sw-TZ")}</p>
            </div>
            <button
              onClick={async () => {
                if (!confirm("Futa makala hii?")) return;
                await supabase.from("blogs").delete().eq("id", p.id);
                load();
              }}
              className="btn !px-3 !py-1.5 bg-red-100 text-red-800"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
