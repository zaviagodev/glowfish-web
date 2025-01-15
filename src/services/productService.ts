import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
  location: string;
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

// Transform product data
const transformProduct = (product: any): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  category_id: product.category_id,
  variant_options: product.variant_options || [],
  product_variants: product.product_variants || [],
  image: product.product_images?.[0]?.url || '/placeholder-image.jpg',
  location: 'Glowfish, Sathon', // Default location
  date: new Date().toLocaleDateString(), // Current date as default
});

export const ProductService = {
  async getProducts(): Promise<Product[]> {
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (url),
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
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No data returned from Supabase');
        return [];
      }

      console.log('Raw data from Supabase:', data);
      const formattedProducts = data.map(transformProduct);
      console.log('Formatted products:', formattedProducts);
      return formattedProducts;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }
};