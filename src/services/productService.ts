import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
  location: string;
  organizer_name : string;
  organizer_contact: string;
  venue_address : string;
  date: string;
  variant_options: any[];
  product_variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    compare_at_price: number | null;
    quantity: number;
    options: Record<string, any>;
    status: string;
    position: number;
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}



// Transform product data
const transformProduct = (event: any): Product => {
  // Get the first valid image URL or use a data URI for a light gray placeholder
  const imageUrl = event?.product?.product_images?.[0]?.url || 
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f5f5f5"/%3E%3C/svg%3E';

  return {
    id: event.id,
    pro_id: event?.product.id,
    name: event?.product?.name,
    description: event?.product?.description,
    price: event?.product?.price,
    category_id: event?.product?.category_id,
    variant_options: event?.product?.variant_options || [],
    track_quantity: event?.product?.track_quantity || false,
    product_variants: event?.product?.product_variants || [],
    image: imageUrl,
    location: event.venue_name, // Default location,
    venue_address: event.venue_address, 
    organizer_contact: event.organizer_contact, 
    organizer_name: event.organizer_name, 
    start_datetime: event.start_datetime, // Current date as default
    end_datetime: event.end_datetime,
  };
};



export const ProductService = {
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          product:products!inner(
            *,
            product_images (*),
            product_variants (
              id,
              name,
              sku,
              price,
              compare_at_price,
              quantity,
              options,
              status,
              position
            ),
            product_categories (
              id,
              name,
              slug,
              description
            ),
            product_tags (*)
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No data returned from Supabase');
        return [];
      }

      const formattedProducts = data.map(transformProduct);

      return formattedProducts;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No categories returned from Supabase');
        return [];
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },
};