import type { BlogPost } from "@/types/database";
import { placeholderImage } from "@/lib/utils";

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400 * 1000).toISOString();

/** Makala za mfano zinazoonyeshwa pale jedwali la `blogs` halina data. */
export const MOCK_BLOGS: BlogPost[] = [
  {
    id: "mock-blog-1",
    created_at: daysAgo(3),
    title: "Jinsi ya Kuanza Biashara Chuoni Kwa Mtaji Mdogo",
    slug: "jinsi-ya-kuanza-biashara-chuoni-kwa-mtaji-mdogo",
    excerpt:
      "Huhitaji mamilioni kuanza. Hizi ni hatua za vitendo za kuanzisha biashara ukiwa mwanachuo, hata kwa mtaji wa TSh 20,000.",
    cover_image: placeholderImage("Biashara Chuoni", "#059669"),
    category: "Biashara",
    content: `Wanachuo wengi wana mawazo mazuri ya biashara lakini wanakwama kwenye swali moja: mtaji. Habari njema ni kwamba biashara nyingi za chuoni zinaanza kwa mtaji mdogo sana, kwa sababu wateja wako wako karibu nawe kila siku.

## 1. Anza na tatizo la wanachuo wenzako
Angalia kinachowasumbua wanafunzi: chakula cha haraka, kuchapisha notes, kusuka nywele, kurekebisha simu au laptop. Biashara bora huanza kwa kutatua tatizo halisi.

## 2. Anza na kile ulichonacho
Kama una ujuzi (kusuka, kupiga picha, graphic design, tuition) huhitaji mtaji mkubwa. Ujuzi wako ndio mtaji. Kama unauza bidhaa, anza na vitu vichache vinavyoenda haraka kama vitafunwa, vocha, au vifaa vidogo vya shule.

## 3. Tumia WhatsApp Status na makundi ya chuo
Weka picha nzuri, bei wazi na namba yako. Wanachuo wanafanya maamuzi haraka wakiona bei na picha pamoja.

## 4. Weka hesabu kila siku
Andika ulichouza, ulichotumia na faida. Usichanganye pesa ya biashara na pesa ya matumizi ya kila siku.

## 5. Kua polepole
Faida ya kwanza irudishe kwenye biashara. Ongeza bidhaa mpya moja baada ya nyingine kulingana na maombi ya wateja.

Kumbuka: biashara ni uvumilivu. Anza leo, hata ndogo, na ujifunze kila wiki.`,
  },
  {
    id: "mock-blog-2",
    created_at: daysAgo(8),
    title: "Mbinu 5 za Kufaulu Mitihani ya Chuo",
    slug: "mbinu-5-za-kufaulu-mitihani-ya-chuo",
    excerpt:
      "Kusoma kwa bidii peke yake hakutoshi. Jifunze mbinu tano zilizothibitika za kujiandaa na kufaulu mitihani ya chuo.",
    cover_image: placeholderImage("Kufaulu Mitihani", "#0F766E"),
    category: "Masomo",
    content: `Mitihani ya chuo inahitaji mpango, si bahati. Hizi ni mbinu tano ambazo wanafunzi wengi waliofaulu vizuri huzitumia.

## 1. Panga ratiba mapema
Usisubiri wiki ya mitihani. Gawanya silabasi kwa wiki, kisha kwa siku. Mpango mdogo unaofuatwa ni bora kuliko mpango mkubwa usiotekelezwa.

## 2. Fanya past papers
Mitihani ya miaka iliyopita inakuonyesha mtindo wa maswali na mada zinazojirudia. Jaribu kuzifanya ndani ya muda halisi wa mtihani.

## 3. Soma kwa vikundi vidogo
Kikundi cha watu 3 hadi 4 kinasaidia kuelezana mada ngumu. Ukiweza kumfundisha mwenzako, umeielewa mada kikweli.

## 4. Pumzika na kula vizuri
Kukesha usiku kucha hupunguza uwezo wa kukumbuka. Lala angalau saa 6 hadi 7 na kunywa maji ya kutosha.

## 5. Uliza mapema
Kama hujaelewa mada, mwone mhadhiri au tutor mapema. Usisubiri siku ya mwisho.

Kumbuka: lengo ni kuelewa, si kukariri. Ukielewa, mtihani unakuwa rahisi.`,
  },
  {
    id: "mock-blog-3",
    created_at: daysAgo(14),
    title: "Namna ya Kuandika CV ya Field IPT",
    slug: "namna-ya-kuandika-cv-ya-field-ipt",
    excerpt:
      "Unatafuta nafasi ya field (IPT)? Hii ndiyo muundo rahisi wa CV unaovutia waajiri na unaokufanya uonekane makini.",
    cover_image: placeholderImage("CV ya Field IPT", "#1D4ED8"),
    category: "Ajira",
    content: `CV nzuri ndiyo mlango wa kwanza wa kupata nafasi ya field. Waajiri wanapokea maombi mengi, hivyo CV yako lazima iwe fupi, safi na yenye taarifa muhimu.

## 1. Taarifa binafsi
Jina kamili, namba ya simu, barua pepe ya kitaalamu (epuka majina ya utani) na mahali unapoishi. Weka picha tu kama inaombwa.

## 2. Lengo fupi
Andika sentensi mbili: unasoma nini, mwaka gani, na unatafuta nini. Mfano: "Mwanafunzi wa mwaka wa tatu wa Uhandisi Kilimo ninayetafuta nafasi ya field kujifunza na kuchangia kwenye miradi ya kilimo."

## 3. Elimu
Taja chuo, kozi, mwaka wa masomo na kozi muhimu ulizosoma zinazohusiana na nafasi unayoomba.

## 4. Ujuzi na miradi
Orodhesha ujuzi halisi (Excel, AutoCAD, programming, mawasiliano) na miradi ya darasani au ya kujitegemea ulioifanya.

## 5. Wadhamini (Referees)
Weka wadhamini wawili, mfano mhadhiri na mtu wa kazi, pamoja na mawasiliano yao. Waombe ruhusa kwanza.

## Vidokezo vya mwisho
Iwe ukurasa mmoja hadi miwili, tumia PDF, na hakikisha huna makosa ya tahajia. Tuma pamoja na barua ya maombi iliyoandikwa kulingana na kampuni husika.`,
  },
];
