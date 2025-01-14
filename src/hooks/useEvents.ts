import { useEffect, useState } from 'react';
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

// Cache key for localStorage
const EVENTS_CACHE_KEY = 'cached_events';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      // Check cache first
      const cachedData = localStorage.getItem(EVENTS_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME;
        
        if (!isExpired) {
          setEvents(data);
          setLoading(false);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
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

      if (fetchError) throw fetchError;

      const transformedEvents = data?.map(order => {
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

      // Update cache
      localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify({
        data: transformedEvents,
        timestamp: Date.now()
      }));

      setEvents(transformedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to force refresh the data
  const refreshEvents = async () => {
    setLoading(true);
    localStorage.removeItem(EVENTS_CACHE_KEY);
    await fetchEvents();
  };

  return { events, loading, error, refreshEvents };
};