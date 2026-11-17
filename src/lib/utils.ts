export function formatPrice(price: number): string {
  return `TSh ${price.toLocaleString("en-US")}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Sasa hivi";
  if (mins < 60) return `Dakika ${mins} zilizopita`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Saa ${hours} zilizopita`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Siku ${days} zilizopita`;
  const months = Math.floor(days / 30);
  return `Miezi ${months} iliyopita`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("sw-TZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return new Date(iso).toDateString();
  }
}

/** Picha ya mfano (SVG) isiyohitaji mtandao. */
export function placeholderImage(label: string, color = "#059669"): string {
  const safe = label.replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0F172A"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><text x="400" y="310" font-family="Arial, sans-serif" font-size="44" font-weight="700" text-anchor="middle" fill="#ffffff">${safe}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export const BROKEN_IMAGE = placeholderImage("Hakuna picha", "#94A3B8");

/** Hubadilisha 07xx.., 7xx.., +255.. kuwa 2557XXXXXXXX. Hurudisha null kama si sahihi. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let full = digits;
  if (digits.length === 10 && digits.startsWith("0")) {
    full = "255" + digits.slice(1);
  } else if (digits.length === 9) {
    full = "255" + digits;
  }
  return /^255[67]\d{8}$/.test(full) ? full : null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
