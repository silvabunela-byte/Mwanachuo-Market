export type Category = 
  | 'Zote'
  | 'Vifaa vya Kielektroniki'
  | 'Nguo & Viatu'
  | 'Chakula & Vinywaji'
  | 'Huduma & Ujuzi'
  | 'Vyumba & Hosteli'
  | 'Vitabu & Vifaa vya Shule';

export type CampusLocation = 
  | 'Maeneo Yote'
  | 'Main Campus'
  | 'Mazimbu'
  | 'Hosteli za Nje'
  | 'Solomon Mahlangu';

export interface Listing {
  id: string;
  created_at: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: 'Mpya' | 'Imetumika';
  campus_location: CampusLocation;
  seller_name: string;
  whatsapp_number: string;
  image_urls: string[];
  is_sponsored?: boolean;
  is_verified?: boolean;
  status: 'approved' | 'pending';
}

export interface LocalAd {
  id: string;
  created_at: string;
  business_name: string;
  banner_url: string;
  target_url: string;
  placement: 'top_banner' | 'feed_banner';
  is_active: boolean;
  clicks_count: number;
}

export interface BlogPost {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category: string;
}
