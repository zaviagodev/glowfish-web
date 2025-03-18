export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  status: string;
  options: any[];
  position: number;
  quantity: number;
  compare_at_price: number | null;
  points_based_price?: number;
}

export interface ProductImage {
  id: string;
  alt: string;
  url: string;
  path: string;
  position: number;
  product_id: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_name: string;
  name: string;
  description?: string;
  price: number;
  compare_at_price: number | null;
  cost: number | null;
  sku: string;
  barcode: string;
  track_quantity: boolean;
  weight: number;
  weight_unit: string;
  status: string;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  has_discount: boolean;
  variant_options: any[];
  is_reward: boolean;
  is_gift_card: boolean;
  is_gift: boolean;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  product_categories: any | null;
  product_tags: any[];
  image?: string;
  images?: {
    id: string;
    url: string;
    alt: string;
    position: number;
  }[];
  pro_id?: string;
  gallery_link?: string;
  location?: string;
  venue_address?: string;
  organizer_contact?: string;
  organizer_name?: string;
  start_datetime?: string;
  end_datetime?: string;
  google_maps_link?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  store_name: string;
  created_at: string;
  updated_at: string;
}

export interface ProductQueryResult {
  events: Product[];
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
} 