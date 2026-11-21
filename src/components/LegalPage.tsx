import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { adminWhatsAppLink } from "@/lib/config";

export interface LegalSection {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
}

interface LegalPageProps {
  icon: LucideIcon;
  title: string;
  intro: string;
  updated: string;
  sections: readonly LegalSection[];
  contactMessage: string;
  other: { href: string; label: string };
}

/** Muundo mmoja wa kurasa za kisheria (Faragha, Sheria na Masharti). */
export default function LegalPage({
  icon: Icon,
  title,
  intro,
  updated,
  sections,
  contactMessage,
  other,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <header className="rounded-3xl bg-gradient-to-br from-[#059669] to-emerald-700 p-6 text-white shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold leading-tight">{title}</h1>
              <p className="mt-0.5 text-xs text-emerald-50">
                Imesasishwa: {updated}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-emerald-50">
            {intro}
          </p>
        </header>

        <nav
          aria-label="Yaliyomo"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="mb-2 text-sm font-extrabold text-slate-900">
            Yaliyomo
          </p>
          <ol className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.title}>
                <a
                  href={`#sehemu-${i + 1}`}
                  className="block py-1 font-medium text-emerald-700 hover:text-emerald-800"
                >
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {sections.map((s, i) => (
          <section
            key={s.title}
            id={`sehemu-${i + 1}`}
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-3 text-lg font-extrabold text-slate-900">
              <span className="mr-2 text-[#059669]">{i + 1}.</span>
              {s.title}
            </h2>
            {s.paragraphs?.map((p) => (
              <p
                key={p}
                className="mb-3 break-words text-sm leading-relaxed text-slate-600 last:mb-0"
              >
                {p}
              </p>
            ))}
            {s.items && (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 marker:text-[#059669]">
                {s.items.map((item) => (
                  <li key={item} className="break-words">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="rounded-2xl bg-emerald-50 p-5 text-center">
          <p className="text-sm font-semibold text-slate-900">
            Una swali kuhusu ukurasa huu?
          </p>
          <a
            href={adminWhatsAppLink(contactMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#059669] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Wasiliana na Afisa Masoko
          </a>
          <p className="mt-4 text-sm text-slate-600">
            Soma pia:{" "}
            <Link
              href={other.href}
              className="font-bold text-emerald-700 hover:text-emerald-800"
            >
              {other.label}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
