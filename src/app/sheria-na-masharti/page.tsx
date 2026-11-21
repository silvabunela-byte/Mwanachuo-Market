import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Sheria na Masharti - Mwanachuo Market",
  description:
    "Masharti ya kutumia Mwanachuo Market: wajibu wa watumiaji na watangazaji, malipo ya Sponsored na Local Ads, kanusho na haki miliki.",
};

const SECTIONS: readonly LegalSection[] = [
  {
    title: "Kukubali masharti",
    paragraphs: [
      "Kwa kutembelea au kutumia Mwanachuo Market (kununua, kuuza, kuweka tangazo, kusoma blogu au habari, au kutoa maoni) unakubali Sheria na Masharti haya pamoja na Sera yetu ya Faragha.",
      "Usipokubaliana na masharti haya, tafadhali usitumie huduma.",
    ],
  },
  {
    title: "Mwanachuo Market ni nini",
    paragraphs: [
      "Mwanachuo Market ni jukwaa la kuunganisha wanunuzi na wauzaji au watoa huduma wa chuoni. Sisi si muuzaji wa bidhaa zinazotangazwa, wala hatuwi upande wa mauzo au makubaliano kati ya watumiaji.",
    ],
  },
  {
    title: "Wajibu wa mtumiaji na mtangazaji",
    items: [
      "Toa taarifa za kweli na sahihi kuhusu wewe, bidhaa au huduma yako.",
      "Weka bei halali na maelezo yasiyopotosha.",
      "Tumia picha halisi za bidhaa au huduma unayotangaza.",
      "Hakikisha namba ya WhatsApp uliyoweka ni yako au umeruhusiwa kuitumia.",
      "Linda PIN ya tangazo lako. Utawajibika kwa mabadiliko yanayofanywa kwa kutumia PIN hiyo.",
      "Heshimu sheria za Jamhuri ya Muungano wa Tanzania na maadili ya chuo chako.",
    ],
  },
  {
    title: "Maudhui yaliyokatazwa",
    paragraphs: ["Hairuhusiwi kuweka matangazo, picha, habari au maoni yanayohusu:"],
    items: [
      "Bidhaa au huduma haramu, zilizoibwa, au zinazokiuka sheria za nchi.",
      "Udanganyifu, utapeli au kupotosha wanunuzi.",
      "Maudhui ya ngono, chuki, vitisho, matusi au unyanyasaji.",
      "Kutumia jina, picha au kazi ya mtu mwingine bila ruhusa.",
      "Barua taka, matangazo yanayojirudia au viungo vya kupotosha.",
    ],
  },
  {
    title: "Mamlaka ya Afisa Masoko",
    paragraphs: [
      "Afisa Masoko ana haki ya kukagua, kuchelewesha, kukataa, kuficha au kufuta tangazo, bango, habari au maoni yoyote yanayokiuka masharti haya, bila taarifa ya awali.",
      "Tunaweza pia kuzuia mtumiaji anayekiuka masharti mara kwa mara. Kupitishwa kwa tangazo hakumaanishi kwamba tunadhamini bidhaa au muuzaji.",
    ],
  },
  {
    title: "Malipo ya Sponsored, Featured na Local Ads",
    items: [
      "Tangazo la Sponsored (juu ya soko) na Local Ads (mabango) ni huduma za kulipia. Bei na vifurushi vinaonyeshwa kwenye ukurasa wa Tangaza Nasi.",
      "Utaratibu wa malipo na muda wa tangazo kuwa hewani unakubaliwa na Afisa Masoko kabla ya tangazo kuwekwa.",
      "Malipo ni kwa ajili ya mwonekano (visibility) tu. Hayahakikishi mauzo, wateja wala idadi ya mibofyo.",
      "Tunaweza kuondoa tangazo la kulipia linalokiuka masharti haya.",
    ],
  },
  {
    title: "Kanusho la uwajibikaji",
    paragraphs: [
      "Malipo na makabidhiano ya bidhaa au huduma yanafanyika moja kwa moja kati ya mnunuzi na muuzaji. Mwanachuo Market haishiriki kwenye malipo hayo, na haiwajibiki kwa hasara, migogoro, ubora wa bidhaa au udanganyifu unaotokana na miamala kati ya watumiaji.",
      "Tunafanya juhudi kuweka taarifa sahihi na huduma ipatikane wakati wote, lakini hatuahidi kwamba tovuti haitakuwa na hitilafu au kukatika.",
    ],
  },
  {
    title: "Vidokezo vya usalama",
    items: [
      "Kutana na muuzaji au mnunuzi eneo la wazi lenye watu wengi ndani ya chuo.",
      "Kagua bidhaa kabla ya kulipa.",
      "Usitume pesa mapema kwa mtu usiyemjua.",
      "Ukiona tangazo la kutiliwa shaka, tuambie Afisa Masoko mara moja.",
    ],
  },
  {
    title: "Haki miliki",
    paragraphs: [
      "Muundo wa tovuti, chapa ya Mwanachuo Market, blogu, habari na maandishi yetu ni mali ya Mwanachuo Market. Hairuhusiwi kuyanakili au kuyatumia kibiashara bila ruhusa ya maandishi.",
      "Maudhui unayoweka (picha na maelezo ya tangazo) yanabaki yako, lakini unatupa ruhusa ya kuyaonyesha kwenye jukwaa kwa ajili ya kutoa huduma.",
    ],
  },
  {
    title: "Mabadiliko ya masharti",
    paragraphs: [
      "Tunaweza kubadilisha masharti haya wakati wowote. Tarehe ya mwisho ya kusasishwa inaonekana juu ya ukurasa. Kuendelea kutumia tovuti baada ya mabadiliko kunamaanisha umekubali masharti mapya.",
    ],
  },
  {
    title: "Sheria zinazotumika",
    paragraphs: [
      "Masharti haya yanafuata sheria za Jamhuri ya Muungano wa Tanzania.",
    ],
  },
];

export default function SheriaNaMashartiPage() {
  return (
    <LegalPage
      icon={ScrollText}
      title="Sheria na Masharti"
      updated="Novemba 2026"
      intro="Soma masharti haya kabla ya kutumia Mwanachuo Market. Yanalinda wanunuzi, wauzaji na jukwaa letu."
      sections={SECTIONS}
      contactMessage="Habari Afisa Masoko, nina swali kuhusu Sheria na Masharti ya Mwanachuo Market."
      other={{ href: "/faragha", label: "Sera ya Faragha" }}
    />
  );
}
