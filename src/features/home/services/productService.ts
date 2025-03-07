import { supabase } from '@/lib/supabase';
import { Product, Category } from '../types/product.types';

// Transform product data
const transformProduct = (event: any): Product => {
  // Get all product images and sort them by position
  const productImages = event?.product?.product_images || [];
  const sortedImages = [...productImages].sort((a: any, b: any) => a.position - b.position);
  
  // Get the first valid image URL or use empty string
  const imageUrl = sortedImages[0]?.url || '';


  return {
    id: event.id,
    pro_id: event?.product?.id,
    name: event?.product?.name,
    description: event?.product?.description,
    price: event?.product?.price,
    category_id: event?.product?.category_id,
    variant_options: event?.product?.variant_options || [],
    track_quantity: event?.product?.track_quantity || false,
    product_variants: event?.product?.product_variants || [],
    gallery_link: event?.gallery_link || '',
    image: imageUrl,
    images: sortedImages.map((img: any) => ({
      id: img.id,
      url: img.url,
      alt: img.alt || '',
      position: img.position
    })),
    location: event.venue_name || '', // Default location
    venue_address: event.venue_address || '', 
    organizer_contact: event.organizer_contact || '', 
    organizer_name: event.organizer_name || '', 
    start_datetime: event.start_datetime || '', // Current date as default
    end_datetime: event.end_datetime || '',
    google_maps_link: event.google_maps_link || '',
  };

};

export const ProductService = {
  async getProducts(storeName: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          product:products!inner(
            *,
            product_images (*),
            product_variants (*),
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
        .eq('store_name', storeName)
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

  async getCategories(storeName: string): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('store_name', storeName)
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

  async getRewards(storeName: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
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
            position,
            points_based_price
          ),
          product_categories (
            id,
            name,
            slug,
            description
          ),
          product_tags (*)
        `,
        )
        .eq('store_name', storeName)
        .eq('is_reward', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No rewards returned from Supabase');
        return [];
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      throw error;
    }
  },
};