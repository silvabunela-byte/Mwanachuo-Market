"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adminWhatsAppLink } from "@/lib/config";
import { uploadImage } from "@/lib/storage";
import { normalizePhone } from "@/lib/utils";
import { welcomeMessage } from "@/lib/listingMessages";
import { CAMPUS_LOCATIONS, CATEGORIES } from "@/types/database";

interface PostAdModalProps {
  open: boolean;
  onClose: () => void;
  onPosted?: () => void;
}

const MAX_IMAGES = 3;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-900">
        {label}
      </span>
      {children}
    </label>
  );
}

function PostAdForm({
  onClose,
  onPosted,
}: {
  onClose: () => void;
  onPosted?: () => void;
}) {
  const postCategories = CATEGORIES.filter((c) => c !== "Zote");
  const postLocations = CAMPUS_LOCATIONS.filter((l) => l !== "Maeneo Yote");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(postCategories[0]);
  const [condition, setCondition] = useState<"Mpya" | "Imetumika">("Imetumika");
  const [price, setPrice] = useState("");
  const [campus, setCampus] = useState<string>(postLocations[0]);
  const [sellerName, setSellerName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [wantsSponsored, setWantsSponsored] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [postedTitle, setPostedTitle] = useState("");
  const [postedSponsored, setPostedSponsored] = useState(false);
  const [postedPin, setPostedPin] = useState("");
  const [postedSeller, setPostedSeller] = useState("");
  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files]
  );
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, submitting]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);

    const priceNumber = Math.round(Number(price));
    const normalizedPhone = normalizePhone(phone);

    if (title.trim().length < 3) return setError("Weka kichwa cha tangazo.");
    if (!Number.isFinite(priceNumber) || priceNumber <= 0)
      return setError("Weka bei sahihi kwa Shilingi ya Tanzania.");
    if (sellerName.trim().length < 2) return setError("Weka jina lako.");
    if (!normalizedPhone)
      return setError(
        "Namba ya WhatsApp si sahihi. Tumia mfumo huu: 2557XXXXXXXX au 07XXXXXXXX."
      );
    if (description.trim().length < 10)
      return setError("Andika maelezo mafupi ya angalau herufi 10.");
    if (!/^\d{4}$/.test(pin)) return setError("PIN lazima iwe tarakimu 4.");
    if (pin !== pinConfirm)
      return setError("PIN mbili hazifanani. Ziandike tena kwa makini.");
    setSubmitting(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await uploadImage(file, "listings"));
      }

          const { error: insertError } = await supabase.rpc("create_listing", {
        p_title: title.trim(),
        p_description: description.trim(),
        p_price: priceNumber,
        p_category: category,
        p_condition: condition,
        p_campus: campus,
        p_seller: sellerName.trim(),
        p_phone: normalizedPhone,
        p_images: urls,
        p_pin: pin,
      });
      if (insertError) throw new Error(insertError.message);

      setPostedTitle(title.trim());
      setPostedSponsored(wantsSponsored);
      setPostedPin(pin);
      setPostedSeller(sellerName.trim());
      setDone(true);
      onPosted?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Imeshindwa kutuma tangazo. Jaribu tena."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-4"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Weka tangazo jipya"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-extrabold text-slate-900">
            {done ? "Tangazo Limetumwa" : "Weka Tangazo Jipya"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Funga"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4 overflow-y-auto p-5 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#059669]" />
            <p className="text-base font-bold text-slate-900">
              Asante! Tangazo lako limepokelewa.
            </p>
                        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {welcomeMessage(postedSeller)}
            </p>
            <p className="text-sm text-slate-500">
              Litaonekana sokoni baada ya Afisa Masoko kulipitisha. Kwa kawaida
              hutokea ndani ya saa chache.
            </p>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left">
              <p className="text-sm font-bold text-emerald-800">
                PIN yako ya siri
              </p>
              <p className="mt-1 text-center text-3xl font-extrabold tracking-[0.4em] text-emerald-700">
                {postedPin}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Ihifadhi mahali salama (piga picha skrini au iandike). Kuhariri
                au kufuta tangazo lako, bonyeza <b>Tangazo Langu</b> kwenye
                menyu, kisha tumia namba yako ya WhatsApp na PIN hii.
              </p>
            </div>
            {postedSponsored && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left">
                <p className="text-sm font-bold text-orange-700">
                  Kuweka tangazo lako juu (Sponsored)
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Gharama ni TSh 2,000 kwa wiki. Tuma ujumbe kwa Afisa Masoko kupata
                  maelekezo ya malipo, kisha tangazo lako litawekwa juu mara
                  tu malipo yakithibitishwa.
                </p>
                <a
                  href={adminWhatsAppLink(
                    `Habari Afisa Masoko, nimeweka tangazo "${postedTitle}" kwenye Mwanachuo Market na nataka liwe juu (Sponsored - TSh 2,000/wiki). Naomba maelekezo ya malipo.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  Wasiliana na Afisa Masoko
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-[#059669] px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Sawa, Funga
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 overflow-y-auto p-4">
              <Field label="Kichwa cha Tangazo">
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mfano: Godoro la 4x6 Inchi 6 - Safi Kabisa"
                  maxLength={120}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Kundi">
                  <select
                    className={inputClass}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {postCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Hali">
                  <select
                    className={inputClass}
                    value={condition}
                    onChange={(e) =>
                      setCondition(e.target.value as "Mpya" | "Imetumika")
                    }
                  >
                    <option value="Mpya">Mpya</option>
                    <option value="Imetumika">Imetumika</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Bei (TSh)">
                  <input
                    className={inputClass}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45000"
                  />
                </Field>
                <Field label="Eneo / Chuo">
                  <select
                    className={inputClass}
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                  >
                    {postLocations.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Jina la Muuzaji">
                  <input
                    className={inputClass}
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Jina lako"
                  />
                </Field>
                <Field label="Namba ya WhatsApp">
                  <input
                    className={inputClass}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="2557XXXXXXXX"
                  />
                </Field>
              </div>

              <Field label="Maelezo">
                <textarea
                  className={`${inputClass} min-h-[110px]`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elezea hali ya bidhaa, sifa zake, au huduma unayotoa..."
                />
              </Field>

              <div>
                <span className="mb-1 block text-sm font-semibold text-slate-900">
                  Picha (hadi {MAX_IMAGES})
                </span>
                <div className="flex flex-wrap gap-2">
                  {previews.map((src, i) => (
                    <div
                      key={src}
                      className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200"
                    >
                      <img
                        src={src}
                        alt={`Picha ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label="Ondoa picha"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {files.length < MAX_IMAGES && (
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-emerald-600 hover:text-emerald-700">
                      <ImagePlus className="h-5 w-5" />
                      Ongeza
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleFiles(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Kila picha isizidi MB 5.
                </p>
              </div>

                            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm text-slate-600">
                  Chagua <b>PIN ya siri ya tarakimu 4</b>. Utaitumia pamoja na
                  namba yako ya WhatsApp kuhariri au kufuta tangazo lako baadaye.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="PIN (tarakimu 4)">
                    <input
                      className={inputClass}
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      value={pin}
                      onChange={(e) =>
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="••••"
                    />
                  </Field>
                  <Field label="Thibitisha PIN">
                    <input
                      className={inputClass}
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      value={pinConfirm}
                      onChange={(e) =>
                        setPinConfirm(
                          e.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      placeholder="••••"
                    />
                  </Field>
                </div>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-3">
                <input
                  type="checkbox"
                  checked={wantsSponsored}
                  onChange={(e) => setWantsSponsored(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-orange-500"
                />
                <span className="text-sm font-medium text-slate-900">
                  Nataka tangazo langu liwe juu (Sponsored - TSh 2,000/wiki)
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Inatuma...
                  </>
                ) : (
                  "Tuma Tangazo"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PostAdModal({
  open,
  onClose,
  onPosted,
}: PostAdModalProps) {
  if (!open) return null;
  return <PostAdForm onClose={onClose} onPosted={onPosted} />;
}
