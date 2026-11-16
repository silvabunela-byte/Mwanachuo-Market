"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ImagePlus, X } from "lucide-react";
import { supabase, IMAGE_BUCKET } from "@/lib/supabase";
import { CATEGORIES, CONDITIONS } from "@/lib/config";
import SetupNotice from "@/components/SetupNotice";

const MAX_IMAGES = 4;

export default function SellPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: CATEGORIES[0] as string,
    condition: "Imetumika",
    campus_location: "",
    seller_name: "",
    whatsapp_number: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((f) => [...f, ...Array.from(list).filter((x) => x.type.startsWith("image/"))].slice(0, MAX_IMAGES));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const price = parseInt(form.price.replace(/[^0-9]/g, ""), 10);
    if (!price) return setError("Weka bei sahihi.");
    let phone = form.whatsapp_number.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) phone = "255" + phone.slice(1);
    if (phone.length < 12) return setError("Weka namba ya WhatsApp sahihi (mfano 0712345678).");

    setBusy(true);
    try {
      const image_urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file);
        if (upErr) throw upErr;
        image_urls.push(supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl);
      }
      const { error: insErr } = await supabase.from("listings").insert({
        ...form,
        price,
        whatsapp_number: phone,
        image_urls,
        status: "pending",
        is_sponsored: false,
        is_verified: false,
      });
      if (insErr) throw insErr;
      setDone(true);
    } catch (err) {
      setError("Imeshindikana kutuma: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <CheckCircle2 className="mx-auto text-emerald-700" size={48} />
        <h1 className="mt-3 font-display text-3xl font-bold">Asante!</h1>
        <p className="mt-2 text-emerald-950/70">
          Bidhaa yako imepokelewa na itaonekana sokoni baada ya kukaguliwa na admin.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/" className="btn-primary">Rudi Sokoni</Link>
          <Link href="/tangaza" className="btn-ghost">Ipeleke Juu ⭐</Link>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <SetupNotice />
      <h1 className="font-display text-4xl font-bold">Uza Bidhaa</h1>
      <p className="mb-6 mt-1 text-emerald-950/70">Bure kabisa. Bidhaa itakaguliwa kabla ya kuonekana sokoni.</p>
      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Jina la bidhaa *</label>
          <input required className="input" value={form.title} onChange={set("title")} placeholder="mf. HP EliteBook 840 G3" />
        </div>
        <div>
          <label className="label">Maelezo</label>
          <textarea rows={4} className="input" value={form.description} onChange={set("description")} placeholder="Hali, sifa, sababu ya kuuza..." />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Bei (TSh) *</label>
            <input required inputMode="numeric" className="input" value={form.price} onChange={set("price")} placeholder="50000" />
          </div>
          <div>
            <label className="label">Kundi *</label>
            <select className="input" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Hali</label>
            <select className="input" value={form.condition} onChange={set("condition")}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Chuo / Eneo</label>
          <input className="input" value={form.campus_location} onChange={set("campus_location")} placeholder="mf. UDSM - Mabibo Hostel" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Jina lako *</label>
            <input required className="input" value={form.seller_name} onChange={set("seller_name")} />
          </div>
          <div>
            <label className="label">Namba ya WhatsApp *</label>
            <input required inputMode="tel" className="input" value={form.whatsapp_number} onChange={set("whatsapp_number")} placeholder="0712 345 678" />
          </div>
        </div>
        <div>
          <label className="label">Picha (hadi {MAX_IMAGES})</label>
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative h-20 w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full rounded-lg object-cover" />
                <button type="button" onClick={() => setFiles(files.filter((_, n) => n !== i))} className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 shadow">
                  <X size={14} />
                </button>
              </div>
            ))}
            {files.length < MAX_IMAGES && (
              <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-emerald-900/30 text-emerald-900/50 hover:border-emerald-700">
                <ImagePlus />
                <input type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
              </label>
            )}
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}
        <button disabled={busy} className="btn-primary w-full !py-3">
          {busy ? "Inatuma..." : "Tuma Bidhaa"}
        </button>
      </form>
    </div>
  );
}
