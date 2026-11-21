"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_LINKS = [
  { href: "/", label: "Soko" },
  { href: "/blog", label: "Blogu" },
  { href: "/habari", label: "Habari" },
  { href: "/tangaza", label: "Tangaza Nasi" },
  { href: "/kuhusu", label: "Kuhusu Sisi" },
  { href: "/mawasiliano", label: "Mawasiliano" },
] as const;

const LEGAL_LINKS = [
  { href: "/faragha", label: "Sera ya Faragha" },
  { href: "/sheria-na-masharti", label: "Sheria na Masharti" },
] as const;

export default function Footer() {
  const pathname = usePathname();
  // Dashboard ya Afisa Masoko haihitaji footer
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-center">
        <p className="text-base font-extrabold text-slate-900">
          Mwanachuo <span className="text-[#059669]">Market</span>
        </p>
        <nav
          aria-label="Viungo vya chini"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-[#059669]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <nav
          aria-label="Viungo vya kisheria"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4"
        >
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Mwanachuo Market. Soko la wanachuo, kwa
          wanachuo.
        </p>
      </div>
    </footer>
  );
}
