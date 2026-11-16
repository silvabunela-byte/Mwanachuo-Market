export type Listing = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string | null;
  campus_location: string | null;
  seller_name: string;
  whatsapp_number: string;
  image_urls: string[] | null;
  is_sponsored: boolean;
  is_verified: boolean;
  status: string;
};

export type LocalAd = {
  id: string;
  created_at: string;
  business_name: string;
  banner_url: string;
  target_url: string;
  placement: string;
  is_active: boolean;
  clicks_count: number;
};

export type Blog = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
};
