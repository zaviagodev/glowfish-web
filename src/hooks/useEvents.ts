import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Event {
  id: string;
  product_name: string;
  variant_name: string;
  location: string;
  date: string;
  image: string;
  status: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          return;
        }

        const { data : customers_data, error: fetchError } = await supabase
        .from('customers')
        .select('*') // Select all columns
        ;

          console.log(customers_data);
        // if (fetchError) throw fetchError;

        // const transformedEvents = data?.map(order => {
        //   const item = order.order_items[0];
        //   const variant = item.product_variants;
        //   const product = variant.product;

        //   return {
        //     id: order.id,
        //     product_name: product.name,
        //     variant_name: variant.name,
        //     date: new Date().toLocaleDateString(),
        //     image: product.product_images?.[0]?.url,
        //     status: order.status
        //   };
        // }) || [];

        // setEvents(transformedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};