"use client";
import { BadgeCheck, MapPin, MessageCircle, Star } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatTSh, waLink } from "@/lib/config";

export default function ListingCard({ item, onOpen }: { item: Listing; onOpen: () => void }) {
  const img = item.image_urls?.[0];
  return (
    <article
      className={`card group flex cursor-pointer flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[6px_6px_0_#064e3b] ${
        item.is_sponsored ? "border-amber-400" : ""
      }`}
      onClick={onOpen}
    >
      <div className="relative aspect-[4/3] bg-emerald-900/5">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-display text-4xl text-emerald-900/20">
            {item.title.slice(0, 1)}
          </div>
        )}
        {item.is_sponsored && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-emerald-950">
            <Star size={12} fill="currentColor" /> Sponsored
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{item.category}</p>
        <h3 className="flex items-start gap-1 font-bold leading-snug">
          {item.title}
          {item.is_verified && <BadgeCheck size={18} className="shrink-0 text-sky-600" aria-label="Imethibitishwa" />}
        </h3>
        <p className="font-display text-xl font-bold text-emerald-900">{formatTSh(item.price)}</p>
        {item.campus_location && (
          <p className="flex items-center gap-1 text-xs text-emerald-950/60">
            <MapPin size={12} /> {item.campus_location}
          </p>
        )}
        <a
          href={waLink(item.whatsapp_number, `Habari ${item.seller_name}, nimeona "${item.title}" kwenye Mwanachuo Market. Bado ipo?`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn-primary mt-auto w-full !py-2"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
      </div>
    </article>
  );
}
