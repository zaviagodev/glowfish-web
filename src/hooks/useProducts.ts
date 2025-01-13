import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  location: string;
  date: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            category_id,
            variant_options,
            product_images (url)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        if (!data) {
          console.warn('No data returned from Supabase');
          setProducts([]);
          return;
        }

        console.log('Raw data from Supabase:', data);

        const formattedProducts = data.map(product => {
          const formatted = {
            id: product.id,
            name: product.name,
            category_id : product.category_id,
            description: product.description,
            price: product.price,
            variant_options: product.variant_options,
            image: product.product_images?.[0]?.url || '/placeholder-image.jpg',
            location: 'Glowfish, Sathon',
            date: new Date().toLocaleDateString(),
          };
          console.log('Formatted product:', formatted);
          return formatted;
        });

        console.log('All formatted products:', formattedProducts);
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};