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
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface Product {
  id: string;
  pro_id: string;
  name: string;
  description?: string;
  price: number;
  sales_price?: number;
  category_id: string;
  variant_options: any[];
  track_quantity: boolean;
  product_variants: ProductVariant[];
  gallery_link?: string;
  image: string;
  images: ProductImage[];
  location: string;
  venue_address: string;
  organizer_contact: string;
  organizer_name: string;
  start_datetime: string;
  end_datetime: string;
  google_maps_link?: string;
  created_at?: string;
  updated_at?: string;
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
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
} 