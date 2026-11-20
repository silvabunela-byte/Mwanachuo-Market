import Link from "next/link";
import { Flag, Megaphone, MessageCircle, Phone, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import { adminWhatsAppLink } from "@/lib/config";

const TOPICS = [
  {
    icon: Megaphone,
    title: "Kuweka tangazo",
    text: "Maswali kuhusu jinsi ya kuweka au kuhariri tangazo lako.",
    message: "Habari Afisa Masoko, nahitaji msaada wa kuweka tangazo kwenye Mwanachuo Market.",
  },
  {
    icon: Wallet,
    title: "Malipo na Sponsored",
    text: "Kuweka tangazo juu (Sponsored), vifurushi na maelekezo ya malipo.",
    message: "Habari Afisa Masoko, nataka maelekezo ya malipo ya tangazo la Sponsored.",
  },
  {
    icon: Flag,
    title: "Kuripoti tangazo",
    text: "Umeona tangazo la kutiliwa shaka au la udanganyifu? Tuambie mara moja.",
    message: "Habari Afisa Masoko, nataka kuripoti tangazo la kutiliwa shaka kwenye Mwanachuo Market.",
  },
] as const;

export default function MawasilianoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <header className="rounded-3xl bg-gradient-to-br from-[#059669] to-emerald-700 p-6 text-white shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Phone className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold">Mawasiliano</h1>
              <p className="mt-0.5 text-sm text-emerald-50">
                Wasiliana na Afisa Masoko wa Mwanachuo Market.
              </p>
            </div>
          </div>
          <a
            href={adminWhatsAppLink("Habari Afisa Masoko, nina swali kuhusu Mwanachuo Market.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#059669] transition hover:bg-emerald-50"
          >
            <MessageCircle className="h-4 w-4" />
            Tuandikie WhatsApp
          </a>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-slate-900">
            Tunaweza kukusaidia nini?
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {TOPICS.map(({ icon: Icon, title, text, message }) => (
              <a
                key={title}
                href={adminWhatsAppLink(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 flex-col rounded-xl bg-emerald-50 p-4 transition duration-300 hover:-translate-y-1 hover:bg-emerald-100 hover:shadow-lg"
              >
                <Icon className="mb-2 h-6 w-6 text-[#059669] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mb-1 font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600">{text}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Unataka kutangaza biashara yako kwa wanachuo? Angalia{" "}
          <Link
            href="/tangaza"
            className="font-bold text-orange-600 hover:text-orange-700"
          >
            Tangaza Nasi
          </Link>{" "}
          kwa vifurushi na bei.
        </section>
      </main>
    </div>
  );
}
