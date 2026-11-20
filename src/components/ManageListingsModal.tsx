"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  MessageCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { adminWhatsAppLink } from "@/lib/config";
import { uploadImage } from "@/lib/storage";
import {
  manageDelete,
  manageLogin,
  manageUpdate,
  type ManageStatus,
} from "@/lib/listingManage";
import { formatPrice, normalizePhone } from "@/lib/utils";
import { CAMPUS_LOCATIONS, CATEGORIES, type Listing } from "@/types/database";

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

interface Badge {
  label: string;
  className: string;
}

/** Hali ya tangazo kwa mtumiaji. */
function statusBadges(l: Listing): Badge[] {
  if (l.status === "rejected") {
    return [{ label: "Kataliwa", className: "bg-red-50 text-red-700" }];
  }
  if (l.status !== "approved") {
    return [{ label: "Inasubiri", className: "bg-amber-50 text-amber-700" }];
  }
  const out: Badge[] = [
    { label: "Imepitishwa", className: "bg-slate-100 text-slate-700" },
  ];
  if (l.is_verified) {
    out.push({ label: "Verified", className: "bg-emerald-50 text-emerald-700" });
  }
  if (l.is_sponsored) {
    out.push({ label: "Sponsored", className: "bg-orange-50 text-orange-700" });
  }
  return out;
}

function lockedMessage(): string {
  return "Majaribio mengi yameshindwa. Subiri dakika 15 kisha jaribu tena.";
}

function ManageForm({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged?: () => void;
}) {
  const editCategories = CATEGORIES.filter((c) => c !== "Zote");
  const editLocations = CAMPUS_LOCATIONS.filter((l) => l !== "Maeneo Yote");

  // Kuingia
  const [phoneInput, setPhoneInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [session, setSession] = useState<{ phone: string; pin: string } | null>(
    null
  );
  const [listings, setListings] = useState<Listing[]>([]);

  // Kuhariri
  const [editing, setEditing] = useState<Listing | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(editCategories[0]);
  const [condition, setCondition] = useState<string>("Imetumika");
  const [price, setPrice] = useState("");
  const [campus, setCampus] = useState<string>(editLocations[0]);
  const [sellerName, setSellerName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [keptUrls, setKeptUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const previews = useMemo(
    () => newFiles.map((f) => URL.createObjectURL(f)),
    [newFiles]
  );
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, busy]);

  const failMessage = (status: ManageStatus): string =>
    status === "locked"
      ? lockedMessage()
      : "Namba ya WhatsApp au PIN si sahihi, au hujaweka tangazo kwa PIN.";

  const handleLogin = async () => {
    setError(null);
    setNotice(null);
    const normalized = normalizePhone(phoneInput);
    if (!normalized) {
      setError("Namba ya WhatsApp si sahihi. Tumia 2557XXXXXXXX au 07XXXXXXXX.");
      return;
    }
    if (!/^\d{4}$/.test(pinInput)) {
      setError("PIN ni tarakimu 4.");
      return;
    }
    setBusy(true);
    try {
      const res = await manageLogin(normalized, pinInput);
      if (res.status !== "ok") {
        setError(failMessage(res.status));
        return;
      }
      setSession({ phone: normalized, pin: pinInput });
      setListings(res.listings);
    } catch (err) {
      console.error(err);
      setError("Imeshindwa kuingia. Jaribu tena.");
    } finally {
      setBusy(false);
    }
  };

  const reload = async (s: { phone: string; pin: string }) => {
    const res = await manageLogin(s.phone, s.pin);
    if (res.status === "ok") {
      setListings(res.listings);
    } else {
      // Matangazo yote yamefutwa au hali imebadilika
      setSession(null);
      setListings([]);
      setPinInput("");
    }
  };

  const startEdit = (l: Listing) => {
    setError(null);
    setNotice(null);
    setEditing(l);
    setTitle(l.title);
    setCategory(l.category);
    setCondition(l.condition);
    setPrice(String(l.price));
    setCampus(l.campus_location);
    setSellerName(l.seller_name);
    setPhone(l.whatsapp_number);
    setDescription(l.description);
    setKeptUrls(l.image_urls ?? []);
    setNewFiles([]);
  };

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const room = MAX_IMAGES - keptUrls.length;
    setNewFiles((prev) => [...prev, ...Array.from(list)].slice(0, Math.max(room, 0)));
  };

  const handleSave = async () => {
    if (!session || !editing) return;
    setError(null);
    const priceNumber = Math.round(Number(price));
    const normalizedPhone = normalizePhone(phone);

    if (title.trim().length < 3) return setError("Weka kichwa cha tangazo.");
    if (!Number.isFinite(priceNumber) || priceNumber <= 0)
      return setError("Weka bei sahihi kwa Shilingi ya Tanzania.");
    if (sellerName.trim().length < 2) return setError("Weka jina lako.");
    if (!normalizedPhone)
      return setError("Namba ya WhatsApp si sahihi. Tumia 2557XXXXXXXX au 07XXXXXXXX.");
    if (description.trim().length < 10)
      return setError("Andika maelezo mafupi ya angalau herufi 10.");

    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of newFiles) {
        uploaded.push(await uploadImage(file, "listings"));
      }
      const status = await manageUpdate({
        listingId: editing.id,
        phone: session.phone,
        pin: session.pin,
        title: title.trim(),
        description: description.trim(),
        price: priceNumber,
        category,
        condition,
        campus,
        seller: sellerName.trim(),
        newPhone: normalizedPhone,
        images: [...keptUrls, ...uploaded],
      });
      if (status !== "ok") {
        setError(failMessage(status));
        return;
      }
      // Kama namba ya WhatsApp imebadilishwa, ingia kwa namba mpya
      const nextSession = { phone: normalizedPhone, pin: session.pin };
      setSession(nextSession);
      await reload(nextSession);
      setEditing(null);
      setNotice(
        "Tangazo limehifadhiwa. Limerudi kusubiri idhini ya Afisa Masoko wa Mwanachuo Market kabla ya kuonekana sokoni."
      );
      onChanged?.();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Imeshindwa kuhifadhi. Jaribu tena."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (l: Listing) => {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const status = await manageDelete(l.id, session.phone, session.pin);
      if (status !== "ok") {
        setError(failMessage(status));
        return;
      }
      setConfirmDeleteId(null);
      setNotice("Tangazo limefutwa kabisa.");
      await reload(session);
      onChanged?.();
    } catch (err) {
      console.error(err);
      setError("Imeshindwa kufuta. Jaribu tena.");
    } finally {
      setBusy(false);
    }
  };

  const heading = editing
    ? "Hariri Tangazo"
    : session
    ? "Matangazo Yangu"
    : "Simamia Tangazo Langu";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Simamia tangazo langu"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setError(null);
                }}
                disabled={busy}
                aria-label="Rudi"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="truncate text-lg font-extrabold text-slate-900">
              {heading}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Funga"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4">
          {notice && (
            <p
              role="status"
              className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
            >
              {notice}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}

          {/* HATUA YA 1: KUINGIA */}
          {!session && (
            <>
              <p className="text-sm text-slate-600">
                Weka namba ya WhatsApp uliyotumia kuweka tangazo na PIN yako ya
                tarakimu 4.
              </p>
              <Field label="Namba ya WhatsApp">
                <input
                  className={inputClass}
                  type="tel"
                  inputMode="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="2557XXXXXXXX au 07XXXXXXXX"
                />
              </Field>
              <Field label="PIN (tarakimu 4)">
                <input
                  className={inputClass}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) =>
                    setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="••••"
                />
              </Field>
              <button
                type="button"
                onClick={handleLogin}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Inaangalia...
                  </>
                ) : (
                  "Ingia"
                )}
              </button>
              <a
                href={adminWhatsAppLink(
                  "Habari Afisa Masoko, nimesahau PIN ya tangazo langu kwenye Mwanachuo Market. Naomba msaada."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <MessageCircle className="h-4 w-4" />
                Umesahau PIN? Wasiliana na Afisa Masoko
              </a>
            </>
          )}

          {/* HATUA YA 2: ORODHA */}
          {session && !editing && (
            <>
              {listings.map((l) => {
                const thumb = l.image_urls && l.image_urls[0];
                return (
                  <div
                    key={l.id}
                    className="space-y-3 rounded-2xl border border-slate-200 p-3"
                  >
                    <div className="flex gap-3">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={l.title}
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-bold text-slate-900">
                          {l.title}
                        </p>
                        <p className="text-sm font-semibold text-[#059669]">
                          {formatPrice(l.price)}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {statusBadges(l).map((b) => (
                            <span
                              key={b.label}
                              className={`rounded-full px-2 py-0.5 text-xs font-bold ${b.className}`}
                            >
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {confirmDeleteId === l.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-red-600">
                          Una uhakika? Hili halirudishwi.
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleDelete(l)}
                          disabled={busy}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {busy ? "Inafuta..." : "Ndiyo, futa"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={busy}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Hapana
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(l)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#059669] px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                          <Pencil className="h-4 w-4" />
                          Hariri
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(l.id)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Futa
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* HATUA YA 3: KUHARIRI */}
          {session && editing && (
            <>
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Ukihifadhi, tangazo litarudi kusubiri idhini ya Afisa Masoko wa
                Mwanachuo Market.
              </p>
              <Field label="Kichwa cha Tangazo">
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                    {editCategories.map((c) => (
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
                    onChange={(e) => setCondition(e.target.value)}
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
                  />
                </Field>
                <Field label="Eneo / Chuo">
                  <select
                    className={inputClass}
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                  >
                    {editLocations.map((l) => (
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
                  />
                </Field>
                <Field label="Namba ya WhatsApp">
                  <input
                    className={inputClass}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Maelezo">
                <textarea
                  className={`${inputClass} min-h-[110px]`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>

              <div>
                <span className="mb-1 block text-sm font-semibold text-slate-900">
                  Picha (hadi {MAX_IMAGES})
                </span>
                <div className="flex flex-wrap gap-2">
                  {keptUrls.map((src, i) => (
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
                        onClick={() =>
                          setKeptUrls((prev) => prev.filter((_, k) => k !== i))
                        }
                        aria-label="Ondoa picha"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {previews.map((src, i) => (
                    <div
                      key={src}
                      className="relative h-20 w-20 overflow-hidden rounded-xl border border-emerald-300"
                    >
                      <img
                        src={src}
                        alt={`Picha mpya ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setNewFiles((prev) => prev.filter((_, k) => k !== i))
                        }
                        aria-label="Ondoa picha"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {keptUrls.length + newFiles.length < MAX_IMAGES && (
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

              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Inahifadhi...
                  </>
                ) : (
                  "Hifadhi Mabadiliko"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManageListingsModal({
  open,
  onClose,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}) {
  if (!open) return null;
  return <ManageForm onClose={onClose} onChanged={onChanged} />;
}
