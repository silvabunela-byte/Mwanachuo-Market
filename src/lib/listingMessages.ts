import { normalizePhone } from "@/lib/utils";
import type { Listing } from "@/types/database";

/** Maamuzi ya Afisa Masoko wa Mwanachuo Market kuhusu tangazo. */
export type ListingDecision = "approved" | "verified" | "sponsored" | "rejected";

interface MessageInput {
  sellerName: string;
  title: string;
  reason?: string | null;
}

function firstName(name: string): string {
  const n = name.trim().split(/\s+/)[0];
  return n || "Mteja";
}

/** Ujumbe wa kukaribisha anapotuma tangazo mara ya kwanza. */
export function welcomeMessage(sellerName: string): string {
  return `Karibu Mwanachuo Market, ${firstName(
    sellerName
  )}! 👋 Tangazo lako limepokelewa. Wakati likisubiri idhini, tembelea soko la wanachuo 🛍️, soma habari na blogu 📰, na ujifunze kuhusu fedha na uwekezaji 📈.`;
}

/** Ujumbe wa tangazo linalosubiri idhini (kwa modal ya "Tangazo Langu"). */
export function pendingMessage(): string {
  return "⏳ Tangazo lako linasubiri idhini ya Afisa Masoko wa Mwanachuo Market. Kwa kawaida ni ndani ya saa chache.";
}

/** Ujumbe wa kirafiki kulingana na uamuzi (hutumika ndani ya tovuti). */
export function decisionMessage(
  decision: ListingDecision,
  input: MessageInput
): string {
  const name = firstName(input.sellerName);
  const title = input.title.trim();
  switch (decision) {
    case "approved":
      return `Habari ${name}! 🎉 Tangazo lako "${title}" limepitishwa na sasa linaonekana sokoni. Karibu pia usome Blogu na Habari, na ujifunze Fedha/Uwekezaji hapa Mwanachuo Market.`;
    case "verified":
      return `Hongera ${name}! ✅ Tangazo lako "${title}" limethibitishwa (Verified), wateja wataliamini zaidi. Tembelea pia Blogu na Fedha/Uwekezaji kwa vidokezo vya wanachuo.`;
    case "sponsored":
      return `Asante ${name}! 🌟 Tangazo lako "${title}" sasa ni Sponsored na linaonekana juu ya mengine. Endelea kufurahia soko la wanachuo, habari/blogu na fedha/uwekezaji hapa Mwanachuo Market.`;
    case "rejected": {
      const reason = (input.reason ?? "").trim();
      return `Pole ${name}. 🙏 Tangazo lako "${title}" halikupitishwa${
        reason ? ` kwa sababu: ${reason}` : ""
      }. Unaweza kulihariri kupitia "Tangazo Langu" na kulituma tena. Mwanachuo Market ipo kwa ajili ya soko la wanachuo, habari/blogu na fedha/uwekezaji.`;
    }
  }
}

/** Ujumbe wa WhatsApp kutoka kwa Afisa Masoko (ujumbe huo huo + sahihi). */
export function whatsappMessage(
  decision: ListingDecision,
  input: MessageInput
): string {
  return `${decisionMessage(decision, input)}\n\n— Afisa Masoko, Mwanachuo Market`;
}

/**
 * Kiungo cha wa.me chenye ujumbe tayari. Hurudisha null kama namba si sahihi
 * (badala ya kutengeneza link mbovu).
 */
export function whatsappLink(phone: string, text: string): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

/** Hali ya sasa ya tangazo kama uamuzi (null kama bado linasubiri). */
export function currentDecision(l: Listing): ListingDecision | null {
  if (l.status === "rejected") return "rejected";
  if (l.status === "approved") {
    if (l.is_sponsored) return "sponsored";
    if (l.is_verified) return "verified";
    return "approved";
  }
  return null;
}

/** Je, uamuzi huu bado unalingana na hali halisi ya tangazo? */
export function decisionStillApplies(
  l: Listing,
  d: ListingDecision
): boolean {
  switch (d) {
    case "rejected":
      return l.status === "rejected";
    case "approved":
      return l.status === "approved";
    case "verified":
      return l.status === "approved" && l.is_verified;
    case "sponsored":
      return l.status === "approved" && l.is_sponsored;
  }
}
