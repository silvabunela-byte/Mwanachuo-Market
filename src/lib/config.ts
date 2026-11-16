// PIN ya Admin Panel (MVP). Badilisha hapa kabla ya kuzindua.
export const ADMIN_PIN = "2026";

// Namba ya WhatsApp ya Admin (format ya kimataifa, bila +)
export const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "";

export const CATEGORIES = [
  "Vitabu & Notes",
  "Simu & Vifaa",
  "Laptop & Kompyuta",
  "Nguo & Viatu",
  "Vifaa vya Hosteli",
  "Huduma",
  "Mengineyo",
] as const;

export const CONDITIONS = ["Mpya", "Imetumika", "Imetumika sana"] as const;

export const AD_PACKAGES = [
  {
    name: "Bidhaa Iliyothibitishwa",
    price: 2000,
    period: "mara moja",
    features: ["Alama ya ✓ Imethibitishwa", "Wanunuzi wanakuamini zaidi", "Inadumu hadi bidhaa iuzwe"],
  },
  {
    name: "Bidhaa ya Juu (Sponsored)",
    price: 5000,
    period: "wiki 1",
    features: ["Inaonekana juu kabisa sokoni", "Alama ya ⭐ Sponsored", "Imethibitishwa bure"],
    highlight: true,
  },
  {
    name: "Bango la Biashara",
    price: 20000,
    period: "mwezi 1",
    features: ["Bango juu ya ukurasa wa soko", "Kiungo cha biashara yako", "Takwimu za mabonyezo"],
  },
];

export function formatTSh(n: number) {
  return "TSh " + new Intl.NumberFormat("en-US").format(n || 0);
}

export function waLink(number: string, text: string) {
  const clean = (number || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}
