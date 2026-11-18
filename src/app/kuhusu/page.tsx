import {
  BadgeCheck,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Target,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { adminWhatsAppLink } from "@/lib/config";

const FEATURES = [
  {
    icon: ShoppingBag,
    title: "Nunua & Uza",
    text: "Vifaa vya kielektroniki, nguo, vitabu, chakula na zaidi kutoka kwa wanachuo wenzako.",
  },
  {
    icon: Users,
    title: "Huduma & Ujuzi",
    text: "Tangaza ujuzi wako: kusafisha, kusuka, kufundisha, ubunifu na mengineyo.",
  },
  {
    icon: BadgeCheck,
    title: "Vyumba & Hosteli",
    text: "Tafuta chumba au hosteli karibu na chuo chako kwa bei unayoimudu.",
  },
] as const;

const STEPS = [
  "Fungua Soko na utafute unachohitaji, au bonyeza \"+ Weka Tangazo\" ili kuuza.",
  "Fungua tangazo uone maelezo, bei na eneo la chuo.",
  "Wasiliana na muuzaji moja kwa moja kupitia WhatsApp.",
  "Kutana naye eneo la chuo lenye watu na ulipe baada ya kukagua bidhaa.",
] as const;

const SAFETY_TIPS = [
  "Kutana eneo la wazi lenye watu wengi ndani ya chuo.",
  "Kagua bidhaa kabla ya kulipa.",
  "Usitume pesa mapema kwa mtu usiyemjua.",
  "Ukiona tangazo la kutiliwa shaka, toa taarifa kwetu kupitia mawasiliano yetu.",
] as const;

export default function KuhusuSisiPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC] px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold text-[#0F172A]">
              Kuhusu Mwanachuo Market
            </h1>
            <p className="mb-4 text-gray-600">
              Mwanachuo Market ni soko maalum la kidijitali lililoundwa kwa
              ajili ya wanachuo wa Tanzania kuwezesha biashara salama, rahisi,
              na za haraka.
            </p>
            <p className="text-gray-600">
              Wanachuo wanaweza kuuza, kununua, kutangaza ujuzi, na kutafuta
              hosteli kupitia mtandao wetu kwa urahisi kabisa.
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-[#0F172A]">Dhamira Yetu</h2>
            </div>
            <p className="text-gray-600">
              Kuwaunganisha wanachuo ili kila mmoja apate anachohitaji karibu
              na chuo chake, na kuwapa wanafunzi wajasiriamali jukwaa la
              kukuza biashara zao bila gharama kubwa.
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">
              Tunachokifanya
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-lg bg-emerald-50 p-4">
                  <Icon className="mb-2 h-6 w-6 text-[#059669]" />
                  <h3 className="mb-1 font-semibold text-[#0F172A]">{title}</h3>
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">
              Jinsi Inavyofanya Kazi
            </h2>
            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#059669] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-[#0F172A]">
                Vidokezo vya Usalama
              </h2>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-gray-600">
              {SAFETY_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-[#059669] p-6 text-white shadow-sm">
            <h2 className="mb-2 text-xl font-bold">Wasiliana Nasi</h2>
            <p className="mb-4 text-emerald-50">
              Una swali, maoni au unataka kutangaza biashara yako? Tuandikie
              WhatsApp.
            </p>
            <a
              href={adminWhatsAppLink("Habari Mwanachuo Market, nina swali.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#059669] transition hover:bg-emerald-50"
            >
              <MessageCircle className="h-4 w-4" />
              Wasiliana kwa WhatsApp
            </a>
          </section>
        </div>
      </main>
    </>
  );
}
