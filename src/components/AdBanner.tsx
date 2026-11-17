"use client";

import { useState } from "react";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import type { LocalAd } from "@/types/database";
import { BROKEN_IMAGE } from "@/lib/utils";

export function AdBanner({
  ad,
  onClick,
  tall = false,
}: {
  ad: LocalAd;
  onClick: (ad: LocalAd) => void;
  tall?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onClick(ad)}
      aria-label={`Tangazo: ${ad.business_name}`}
      className={`relative block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition hover:shadow-md ${
        tall ? "h-36 sm:h-48" : "h-24 sm:h-32"
      }`}
    >
      <img
        src={broken ? BROKEN_IMAGE : ad.banner_url}
        alt={ad.business_name}
        onError={() => setBroken(true)}
        className="h-full w-full object-cover"
      />
      <span className="absolute left-2 top-2 rounded-full bg-[#F97316] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
        Sponsored
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-3 pb-2 pt-6 text-left text-sm font-bold text-white">
        {ad.business_name}
      </span>
    </button>
  );
}

/** Bango la nyumbani linaloonyeshwa pale hakuna tangazo halisi. */
export function HouseAd({ tall = false }: { tall?: boolean }) {
  return (
    <Link
      href="/tangaza"
      className={`flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#059669] to-emerald-800 px-5 text-white shadow-sm transition hover:shadow-md ${
        tall ? "h-36 sm:h-44" : "h-24 sm:h-28"
      }`}
    >
      <div>
        <span className="rounded-full bg-[#F97316] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Sponsored
        </span>
        <p className="mt-2 text-base font-extrabold sm:text-xl">
          Biashara yako ionekane hapa!
        </p>
        <p className="text-xs text-emerald-50 sm:text-sm">
          Wafikie maelfu ya wanachuo. Bonyeza kuona bei za matangazo.
        </p>
      </div>
      <Megaphone className="hidden h-12 w-12 shrink-0 text-white/80 sm:block" />
    </Link>
  );
}
