"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Plus, X } from "lucide-react";

const links = [
  { href: "/", label: "Soko" },
  { href: "/blog", label: "Blogu" },
  { href: "/tangaza", label: "Tangaza" },
];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));

  return (
    <header className="sticky top-0 z-30 border-b-2 border-emerald-950/10 bg-[var(--paper)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-800 font-display text-lg font-bold text-amber-300">
            M
          </span>
          <span className="font-display text-xl font-bold">
            Mwanachuo<span className="text-amber-600">.</span>Market
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                active(l.href) ? "bg-emerald-900 text-amber-50" : "hover:bg-emerald-900/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/uza" className="btn-accent ml-2">
            <Plus size={16} /> Uza Bidhaa
          </Link>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menyu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-emerald-950/10 px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 font-bold">
              {l.label}
            </Link>
          ))}
          <Link href="/uza" onClick={() => setOpen(false)} className="btn-accent mt-1">
            <Plus size={16} /> Uza Bidhaa
          </Link>
        </nav>
      )}
    </header>
  );
}
