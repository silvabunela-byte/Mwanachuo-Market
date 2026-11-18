"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Megaphone, Search, ShoppingBag, X } from "lucide-react";

interface NavbarProps {
  /** Kama hazijawekwa, kisanduku cha kutafuta hakionyeshwi. */
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  /** Kama haijawekwa, kitufe kinaelekeza `/?post=1`. */
  onOpenPostModal?: () => void;
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tafuta laptop, godoro, chakula, au huduma..."
        aria-label="Tafuta bidhaa au huduma"
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Futa maandishi"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Soko" },
  { href: "/blog", label: "Blogu" },
  { href: "/kuhusu", label: "Kuhusu Sisi" },
  { href: "/mawasiliano", label: "Mawasiliano" }
] as const;

export default function Navbar({
  searchQuery,
  onSearchChange,
  onOpenPostModal,
}: NavbarProps) {
  const pathname = usePathname();
  const showSearch = onSearchChange !== undefined;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? "bg-emerald-50 text-emerald-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const postButtonClass =
    "rounded-full bg-[#059669] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95";

  const postLabel = (
    <>
      <span className="sm:hidden">+ Uza</span>
      <span className="hidden sm:inline">+ Weka Tangazo</span>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#059669] text-white">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white">
              <GraduationCap className="h-3 w-3 text-white" />
            </span>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Mwanachuo <span className="text-[#059669]">Market</span>
          </span>
        </Link>

        {showSearch ? (
          <div className="hidden max-w-xl flex-1 md:block">
            <SearchBox
              value={searchQuery ?? ""}
              onChange={onSearchChange as (v: string) => void}
            />
          </div>
        ) : (
          <div className="hidden flex-1 md:block" />
        )}

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(isActive(l.href))}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/tangaza"
            className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600"
          >
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Tangaza Nasi</span>
          </Link>
          {onOpenPostModal ? (
            <button
              type="button"
              onClick={onOpenPostModal}
              className={postButtonClass}
            >
              {postLabel}
            </button>
          ) : (
            <Link href="/?post=1" className={postButtonClass}>
              {postLabel}
            </Link>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="px-4 pb-2 md:hidden">
          <SearchBox
            value={searchQuery ?? ""}
            onChange={onSearchChange as (v: string) => void}
          />
        </div>
      )}

      <nav className="flex items-center gap-1 px-4 pb-2 md:hidden">
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={linkClass(isActive(l.href))}>
            {l.label}
          </Link>
        ))}
        <Link
          href="/tangaza"
          className={linkClass(pathname.startsWith("/tangaza"))}
        >
          Tangaza Nasi
        </Link>
      </nav>
    </header>
  );
}
