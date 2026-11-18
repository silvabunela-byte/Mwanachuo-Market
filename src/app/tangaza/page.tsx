"use client";

import { CheckCircle2, MessageCircle, Megaphone, Rocket, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { adminWhatsAppLink } from "@/lib/config";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: typeof Rocket;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Boost Tangazo",
    price: "TSh 500",
    period: "kwa wiki",
    description:
      "Tangazo lako la bidhaa au huduma linaonyeshwa juu ya mengine yote sokoni.",
    features: [
      "Beji ya Sponsored",
      "Linaonekana kwanza kwenye feed",
      "Linafaa wauzaji binafsi",
    ],
    icon: Rocket,
  },
  {
    name: "Bango la Kati",
    price: "TSh 1,500",
    period: "kwa mwezi",
    description:
      "Bango la biashara yako linaonyeshwa katikati ya bidhaa na kwenye makala za blogu.",
    features: [
      "Bango kubwa lenye picha yako au bidhaa yako",
      "Link ya WhatsApp au Instagram",
      "Ripoti ya idadi ya mabonyezo",
    ],
    icon: Megaphone,
  },
  {
    name: "Bango Kuu la Juu",
    price: "TSh 2,000",
    period: "kwa mwezi",
    description:
      "Nafasi bora kabisa: bango lako ndilo la kwanza kuonekana kila mwanachuo na watumiaji anapofungua tovuti.",
    features: [
      "Nafasi ya juu kabisa ya ukurasa",
      "Linazunguka pamoja na mabango mengine ya juu",
      "Ripoti ya idadi ya mabonyezo",
    ],
    icon: Star,
    highlight: true,
  },
];

const STEPS = [
  "Chagua kifurushi kinachokufaa hapa chini.",
  "Bonyeza kitufe cha WhatsApp ili kuwasiliana na Admin.",
  "Tuma picha ya bango (au maelezo ya tangazo) pamoja na link ya WhatsApp/Instagram ya biashara yako.",
  "Admin atakupa maelekezo ya malipo (M-Pesa, Tigo Pesa, Airtel Money au Halopesa).",
  "Malipo yakithibitishwa, tangazo lako linawekwa hewani ndani ya nusu saa tu.",
];

export default function TangazaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <header className="text-center">
          <span className="inline-block rounded-full bg-[#F97316] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Tangaza Nasi
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Wafikie wanachuo wote kwa bei nafuu
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Migahawa, saluni, stationeries, maduka ya simu na hosteli: weka
            biashara yako mbele ya maelfu ya wanachuo kila siku.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
                    {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                style={{ animationDelay: `${i * 150}ms` }}
                className={`animate-fade-up group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  plan.highlight
                    ? "border-[#F97316] ring-2 ring-orange-100"
                    : "border-slate-200"
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    plan.highlight
                      ? "bg-[#F97316] text-white"
                      : "bg-emerald-50 text-[#059669]"
                  }`}
                >
                                   <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-slate-900">
                  {plan.name}
                </h2>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {plan.price}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    {plan.period}
                  </span>
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {plan.description}
                </p>
                <ul className="mt-3 space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={adminWhatsAppLink(
                    `Habari Admin, nataka kuchukua kifurushi cha "${plan.name}" (${plan.price} ${plan.period}) kwenye Mwanachuo Market. Naomba maelekezo.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-5 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                    plan.highlight
                      ? "bg-[#F97316] hover:bg-orange-600"
                      : "bg-[#059669] hover:bg-emerald-700"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chukua Kifurushi
                </a>
              </div>
            );
          })}
        </section>

                <section
          style={{ animationDelay: "450ms" }}
          className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="text-lg font-extrabold text-slate-900">
            Jinsi ya kulipia na kuweka tangazo
          </h2>
          <ol className="mt-3 space-y-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#059669] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
          <a
            href={adminWhatsAppLink(
              "Habari Admin, nataka kuuliza kuhusu matangazo kwenye Mwanachuo Market."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <MessageCircle className="h-5 w-5" />
            Wasiliana na Admin WhatsApp
          </a>
        </section>
      </main>
    </div>
  );
}
