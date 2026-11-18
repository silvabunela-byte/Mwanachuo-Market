export interface Listing {
  id: string;
  created_at: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "Mpya" | "Imetumika" | string;
  campus_location: string;
  seller_name: string;
  whatsapp_number: string;
  image_urls: string[] | null;
  is_sponsored: boolean;
  is_verified: boolean;
  status: string;
}

export interface LocalAd {
  id: string;
  created_at: string;
  business_name: string;
  banner_url: string;
  target_url: string;
  placement: "top_banner" | "feed_banner" | string;
  is_active: boolean;
  clicks_count: number;
}

export interface BlogPost {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
}

export const CATEGORIES = [
  "Zote",
  "Vifaa vya Kielektroniki",
  "Nguo & Viatu",
  "Chakula & Vinywaji",
  "Huduma & Ujuzi",
  "Vyumba & Hosteli",
  "Vitabu & Vifaa vya Shule",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CAMPUS_LOCATIONS = [
  "Maeneo Yote",
  "Main Campus",
  "Mazimbu",
  "Hosteli za Nje",
  "Solomon Mahlangu",
] as const;

export type CampusLocation = (typeof CAMPUS_LOCATIONS)[number];

export interface NewsItem {
  id: string;
  created_at: string;
  title: string;
  body: string;
  is_new: boolean;
}
