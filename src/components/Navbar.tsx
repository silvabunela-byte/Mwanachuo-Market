"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Info,
  Megaphone,
  Menu,
  Newspaper,
  Search,
  ShoppingBag,
  Store,
  Phone,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hasNewNews } from "@/lib/news";

interface NavbarProps {
  /** Kama hazijawekwa, kisanduku cha kutafuta hakionyeshwi. */
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  /** Kama haijawekwa, kitufe kinaelekeza `/?post=1`. */
  onOpenPostModal?: () => void;
    /** Kama haijawekwa, kiungo cha "Tangazo Langu" kinaelekeza `/?manage=1`. */
  onOpenManageModal?: () => void;
}

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Kiungo cha rangi ya machungwa (mfano: Tangaza Nasi). */
  accent?: boolean;
    /** Kiungo kinachofungua modal ya "Simamia Tangazo Langu". */
  manage?: boolean;
}

/**
 * VIUNGO VYA MENYU: kuongeza ukurasa mpya, ongeza mstari mmoja hapa.
 * Mfano: { href: "/ukurasa-wako", label: "Jina", icon: Info },
 */
const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Soko", icon: Store },
  { href: "/blog", label: "Blogu", icon: BookOpen },
  { href: "/habari", label: "Habari", icon: Newspaper },
  { href: "/tangaza", label: "Tangaza Nasi", icon: Megaphone, accent: true },
  { href: "/uwekezaji", label: "Fedha/Uwekezaji", icon: TrendingUp },
  { href: "/kuhusu", label: "Kuhusu Sisi", icon: Info },
  { href: "/mawasiliano", label: "Mawasiliano", icon: Phone },
  { href: "/?manage=1", label: "Tangazo Langu", icon: Settings, manage: true },
];

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

function NewDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex h-2.5 w-2.5 ${className}`}
      aria-label="Kuna habari mpya"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
    </span>
  );
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  onOpenPostModal,
  onOpenManageModal,
}: NavbarProps) {
  const pathname = usePathname();
  const [hasNew, setHasNew] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const showSearch = onSearchChange !== undefined;

  useEffect(() => {
    let cancelled = false;
    hasNewNews().then((v) => {
      if (!cancelled) setHasNew(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Funga menyu ukurasa ukibadilika
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Funga menyu kwa kitufe cha Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const desktopLinkClass = (active: boolean, accent?: boolean) =>
    `inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? accent
          ? "bg-orange-50 text-orange-600"
          : "bg-emerald-50 text-emerald-700"
        : accent
        ? "text-orange-500 hover:bg-orange-50 hover:text-orange-600"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const mobileLinkClass = (active: boolean, accent?: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition ${
      active
        ? accent
          ? "bg-orange-50 text-orange-600"
          : "bg-emerald-50 text-emerald-700"
        : accent
        ? "text-orange-500 hover:bg-orange-50"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  const postButtonClass =
    "whitespace-nowrap rounded-full bg-[#059669] px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 sm:px-4";

  const postLabel = (
    <>
      <span className="sm:hidden">+ Uza</span>
      <span className="hidden sm:inline">+ Weka Tangazo</span>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        {/* Logo */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#059669] text-white">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white">
              <GraduationCap className="h-3 w-3 text-white" />
            </span>
          </span>
          <span className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
            Mwanachuo <span className="text-[#059669]">Market</span>
          </span>
        </Link>

        {/* Kutafuta (laptop) */}
        {showSearch ? (
          <div className="hidden max-w-xl flex-1 xl:block">
            <SearchBox
              value={searchQuery ?? ""}
              onChange={onSearchChange as (v: string) => void}
            />
          </div>
        ) : (
          <div className="hidden flex-1 xl:block" />
        )}

        {/* Viungo (laptop) */}
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Menyu kuu">
                   {NAV_LINKS.map((l) =>
            l.manage && onOpenManageModal ? (
              <button
                key={l.href}
                type="button"
                onClick={onOpenManageModal}
                className={desktopLinkClass(false, l.accent)}
              >
                {l.label}
              </button>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className={desktopLinkClass(
                  l.manage ? false : isActive(l.href),
                  l.accent
                )}
              >
                {l.label}
                {l.href === "/habari" && hasNew && <NewDot className="ml-1.5" />}
              </Link>
            )
          )}
        </nav>

        {/* Kitufe cha kuweka tangazo + hamburger */}
        <div className="flex shrink-0 items-center gap-2">
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

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Funga menyu" : "Fungua menyu"}
            aria-expanded={menuOpen}
            aria-controls="menyu-ya-simu"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 xl:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            {hasNew && !menuOpen && (
              <NewDot className="absolute -right-0.5 -top-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Kutafuta (simu na tablet) */}
      {showSearch && (
        <div className="px-3 pb-2 sm:px-4 xl:hidden">
          <SearchBox
            value={searchQuery ?? ""}
            onChange={onSearchChange as (v: string) => void}
          />
        </div>
      )}

      {/* Menyu ya hamburger (simu na tablet) */}
      {menuOpen && (
        <nav
          id="menyu-ya-simu"
          aria-label="Menyu ya simu"
          className="max-h-[70vh] overflow-y-auto border-t border-slate-100 bg-white px-3 pb-3 pt-2 sm:px-4 xl:hidden"
        >
          <ul className="space-y-1">
            {navLinks.map((l) => {
  const Icon = l.icon;

  if (l.manage && onOpenManageModal) {
    return (
      <li key={l.href}>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            onOpenManageModal();
          }}
          className={`w-full ${mobileLinkClass(false, l.accent)}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left">
            {l.label}
          </span>
        </button>
      </li>
    );
  }

  return (
    <li key={l.href}>
      <Link
        href={l.href}
        onClick={() => setMenuOpen(false)}
        className={mobileLinkClass(
          l.manage ? false : isActive(l.href),
          l.accent
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{l.label}</span>
      </Link>
    </li>
  );
})}
          </ul>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Funga menyu
          </button>
        </nav>
      )}
    </header>
  );
}
