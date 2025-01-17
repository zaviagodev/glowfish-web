// src/services/eventService.ts
import { supabase } from '@/lib/supabase';

export interface Event {
  id: string;
  product_name: string;
  variant_name: string;
  variant_options: Record<string, string>[];
  location: string;
  date: string;
  image: string;
  status: string;
}

export const EventService = {
  async getEvents(): Promise<Event[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            variant_id,
            quantity,
            price,
            total,
            product_variants (
              name,
              options,
              product:products (
                name,
                status,
                product_images (
                  id,
                  url,
                  alt,
                  position
                )
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data
      const events = data?.map(order => {
        const item = order.order_items[0];
        const variant = item.product_variants;
        const product = variant.product;

        return {
          id: order.id,
          product_name: product.name,
          variant_name: variant.name,
          variant_options: variant.options || [],
          date: new Date().toLocaleDateString(),
          image: product.product_images?.[0]?.url,
          status: order.status
        };
      }) || [];

      return events;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }
};
