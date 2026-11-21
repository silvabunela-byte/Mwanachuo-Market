import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Sera ya Faragha - Mwanachuo Market",
  description:
    "Jifunze jinsi Mwanachuo Market inavyokusanya, kutumia na kulinda taarifa zako, pamoja na matumizi ya cookies na matangazo ya Google AdSense.",
};

const SECTIONS: readonly LegalSection[] = [
  {
    title: "Utangulizi",
    paragraphs: [
      "Mwanachuo Market ni soko la kidijitali la wanachuo wa Tanzania. Tunaheshimu faragha yako na tunataka ujue waziwazi taarifa gani zinakusanywa, kwa nini, na una haki gani juu yake.",
      "Kwa kutumia tovuti hii unakubali mambo yaliyoelezwa kwenye ukurasa huu. Usipokubaliana nayo, tafadhali acha kutumia huduma.",
    ],
  },
  {
    title: "Taarifa tunazokusanya",
    paragraphs: [
      "Tunakusanya na kuonyesha taarifa unazotupatia kwa hiari yako tu:",
    ],
    items: [
      "Majina ya wauzaji na watoa huduma yanayowekwa kwenye matangazo.",
      "Namba za WhatsApp zinazowekwa kwa hiari kwenye matangazo. Namba hizi huonekana hadharani ili wanunuzi waweze kuwasiliana na muuzaji.",
      "Picha za bidhaa, huduma, mabango ya Local Ads, na picha za habari au makala.",
      "PIN ya siri ya tarakimu 4 unayoichagua unapoweka tangazo, inayotumika kukutambulisha unaposimamia tangazo lako.",
      "Maoni (jina na maudhui) unayoandika kwenye makala za blogu.",
      "Taarifa za msingi za kiufundi za matumizi ya tovuti, kama aina ya kifaa, browser, kurasa zilizotembelewa na idadi ya mibofyo kwenye mabango.",
    ],
  },
  {
    title: "Jinsi tunavyotumia taarifa zako",
    items: [
      "Kuunganisha wanunuzi na wauzaji kupitia WhatsApp.",
      "Kuthibitisha, kupitisha na kusimamia matangazo na mabango.",
      "Kukuwezesha kuhariri au kufuta tangazo lako kwa kutumia namba yako ya WhatsApp na PIN.",
      "Kuboresha huduma na kuelewa ni kurasa na vipengele gani vinatumika zaidi.",
      "Kuzuia udanganyifu, barua taka na matumizi mabaya ya jukwaa.",
    ],
  },
  {
    title: "Cookies na matangazo ya wahusika wengine",
    paragraphs: [
      "Tovuti hii inaweza kutumia cookies na teknolojia zinazofanana ili kufanya huduma ifanye kazi vizuri, kupima trafiki, na kuonyesha matangazo.",
      "Tunaweza kutumia Google AdSense. Google na washirika wake wanaweza kutumia cookies kuonyesha matangazo kulingana na ziara zako za awali kwenye tovuti hii na tovuti nyingine. Unaweza kudhibiti matangazo yaliyobinafsishwa kupitia Mipangilio ya Matangazo ya Google (adssettings.google.com).",
      "Unaweza pia kuzuia au kufuta cookies kupitia mipangilio ya browser yako. Ukizizima, baadhi ya vipengele vya tovuti vinaweza kutofanya kazi ipasavyo.",
    ],
  },
  {
    title: "Wahusika wengine tunaowategemea",
    paragraphs: [
      "Ili kuendesha tovuti tunatumia huduma za wahusika wengine, kama vile Vercel (kuhifadhi tovuti) na Supabase (kuhifadhi database na picha). Taarifa zako huhifadhiwa kwenye mifumo yao kwa ajili ya kuendesha huduma tu.",
      "Hatuuzi taarifa zako kwa mtu yeyote. Ukibofya kiungo cha WhatsApp, mazungumzo yanaendelea kwenye WhatsApp na yanafuata sera za WhatsApp, si zetu.",
    ],
  },
  {
    title: "Usalama wa taarifa",
    paragraphs: [
      "Tunachukua hatua za kiufundi na za kiutendaji kulinda taarifa zako, ikiwa ni pamoja na kuzuia watu wasioruhusiwa kubadilisha data na kuweka ukurasa wa usimamizi nyuma ya akaunti yenye nenosiri.",
      "Hata hivyo, hakuna mfumo wa mtandaoni unaoweza kuahidi usalama kamili. Kumbuka kwamba namba ya WhatsApp na picha unazoweka kwenye tangazo zinaonekana kwa kila mtu, na usiweke taarifa binafsi usizotaka zijulikane.",
      "Linda PIN yako ya tangazo na usimshirikishe mtu yeyote.",
    ],
  },
  {
    title: "Haki zako",
    items: [
      "Kuomba tangazo lako au taarifa zako zifutwe au zirekebishwe.",
      "Kuhariri au kufuta tangazo lako mwenyewe kupitia kipengele cha kusimamia tangazo.",
      "Kuuliza ni taarifa gani tunazo kuhusu tangazo lako.",
      "Kudhibiti cookies kupitia browser yako.",
    ],
    paragraphs: [
      "Ili kutumia haki hizi, wasiliana na Afisa Masoko kupitia WhatsApp (kiungo chini ya ukurasa huu). Tutajibu kwa haraka iwezekanavyo.",
    ],
  },
  {
    title: "Mabadiliko ya sera hii",
    paragraphs: [
      "Tunaweza kuboresha sera hii mara kwa mara. Tarehe ya mwisho ya kusasishwa inaonekana juu ya ukurasa. Kuendelea kutumia tovuti baada ya mabadiliko kunamaanisha umekubali toleo jipya.",
    ],
  },
];

export default function FaragaPage() {
  return (
    <LegalPage
      icon={ShieldCheck}
      title="Sera ya Faragha"
      updated="Novemba 2026"
      intro="Tunakueleza kwa lugha rahisi jinsi Mwanachuo Market inavyokusanya, kutumia na kulinda taarifa zako."
      sections={SECTIONS}
      contactMessage="Habari Afisa Masoko, nina swali kuhusu Sera ya Faragha ya Mwanachuo Market."
      other={{ href: "/sheria-na-masharti", label: "Sheria na Masharti" }}
    />
  );
}
