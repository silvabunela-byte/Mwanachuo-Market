import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-emerald-950 text-amber-50/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-display text-lg font-bold text-amber-300">Mwanachuo Market</span>
          <br />
          Soko la wanachuo, kwa wanachuo. 🇹🇿
        </p>
        <div className="flex gap-4">
          <Link href="/blog" className="hover:text-amber-300">Blogu</Link>
          <Link href="/tangaza" className="hover:text-amber-300">Tangaza</Link>
          <Link href="/admin" className="hover:text-amber-300">Admin</Link>
        </div>
        <p className="text-xs text-amber-50/50">Kutana sehemu ya wazi chuoni. Usitume pesa kabla ya kuona bidhaa.</p>
      </div>
    </footer>
  );
}
