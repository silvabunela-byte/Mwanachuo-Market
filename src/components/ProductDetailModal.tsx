"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  MapPin,
  MessageCircle,
  ShieldAlert,
  X,
} from "lucide-react";
import type { Listing } from "@/types/database";
import { BROKEN_IMAGE, formatPrice } from "@/lib/utils";

interface ProductDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
}

function ModalContent({
  listing,
  onClose,
}: {
  listing: Listing;
  onClose: () => void;
}) {
  const images =
    listing.image_urls && listing.image_urls.length > 0
      ? listing.image_urls
      : [BROKEN_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const srcFor = (i: number) => (failed[i] ? BROKEN_IMAGE : images[i]);

  const message = `Habari ${listing.seller_name}, nimeona "${listing.title}" (TSh ${listing.price.toLocaleString(
    "en-US"
  )}) kwenye Mwanachuo Market. Je, bado ipo?`;
  const whatsappUrl = `https://wa.me/${listing.whatsapp_number}?text=${encodeURIComponent(
    message
  )}`;

  const isNew = listing.condition === "Mpya";

  return (
    <div
      className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={listing.title}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Funga"
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow hover:bg-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="overflow-y-auto">
        <div className="bg-slate-100">
          <img
            src={srcFor(activeIndex)}
            alt={listing.title}
            onError={() => setFailed((f) => ({ ...f, [activeIndex]: true }))}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 pt-3">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Picha ya ${i + 1}`}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === activeIndex ? "border-emerald-600" : "border-transparent"
                }`}
              >
                <img
                  src={srcFor(i)}
                  alt=""
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {listing.is_sponsored && (
              <span className="rounded-full bg-[#F97316] px-2.5 py-1 text-xs font-bold text-white">
                Sponsored
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isNew
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-stone-200 text-stone-700"
              }`}
            >
              {listing.condition}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {listing.category}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-extrabold leading-snug text-slate-900">
              {listing.title}
            </h2>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {formatPrice(listing.price)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {listing.campus_location}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-bold text-slate-900">Maelezo</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {listing.description || "Hakuna maelezo yaliyowekwa."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {listing.seller_name}
              </span>
              {listing.is_verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <BadgeCheck className="h-4 w-4 text-[#059669]" />
                  Mwanachuo Aliyethibitishwa
                </span>
              )}
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              Usilipe pesa kabla ya kuona bidhaa. Kutaneni eneo la wazi chuoni.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={() =>
            window.open(whatsappUrl, "_blank", "noopener,noreferrer")
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" />
          Chat na Muuzaji WhatsApp
        </button>
      </div>
    </div>
  );
}

export default function ProductDetailModal({
  listing,
  onClose,
}: ProductDetailModalProps) {
  useEffect(() => {
    if (!listing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [listing, onClose]);

  if (!listing) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <ModalContent key={listing.id} listing={listing} onClose={onClose} />
    </div>
  );
}
