import { Check, MessageCircle } from "lucide-react";
import { AD_PACKAGES, ADMIN_WHATSAPP, formatTSh, waLink } from "@/lib/config";

export default function TangazaPage() {
  return (
    <>
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Bei za matangazo</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">Fikia maelfu ya wanachuo</h1>
        <p className="mt-3 text-emerald-950/70">
          Peleka bidhaa yako juu, ipate alama ya kuaminika, au weka bango la biashara yako mbele ya wanachuo kila siku.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {AD_PACKAGES.map((p) => (
          <div
            key={p.name}
            className={`card flex flex-col p-6 ${p.highlight ? "border-emerald-900 bg-emerald-900 text-amber-50 md:-translate-y-3" : ""}`}
          >
            {p.highlight && (
              <span className="mb-3 self-start rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-emerald-950">Maarufu</span>
            )}
            <h2 className="font-display text-xl font-bold">{p.name}</h2>
            <p className="mt-3 font-display text-4xl font-bold">{formatTSh(p.price)}</p>
            <p className={`text-sm ${p.highlight ? "text-amber-50/70" : "text-emerald-950/60"}`}>/ {p.period}</p>
            <ul className="my-6 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check size={18} className={p.highlight ? "text-amber-300" : "text-emerald-700"} /> {f}
                </li>
              ))}
            </ul>
            <a
              href={waLink(ADMIN_WHATSAPP, `Habari Admin, ningependa kifurushi cha "${p.name}" (${formatTSh(p.price)}) kwenye Mwanachuo Market.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={p.highlight ? "btn-accent" : "btn-primary"}
            >
              <MessageCircle size={16} /> Lipia kupitia WhatsApp
            </a>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-emerald-950/60">
        Malipo kwa M-Pesa, Tigo Pesa au Airtel Money. Baada ya kulipa, admin atawasha kifurushi chako.
      </p>
    </>
  );
}
