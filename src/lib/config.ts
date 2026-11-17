export const ADMIN_PIN = "2026";

// Weka namba yako halisi kwenye .env.local: NEXT_PUBLIC_ADMIN_WHATSAPP=2557XXXXXXXX
export const ADMIN_WHATSAPP =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "255786187110";

export const STORAGE_BUCKET = "product-images";

export function adminWhatsAppLink(message: string): string {
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
