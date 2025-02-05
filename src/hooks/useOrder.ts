import { useState, useEffect } from 'react';
import { OrderService, Order } from '@/services/orderService';
import { useStore } from '@/hooks/useStore';

export const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeName } = useStore();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!storeName || !orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const orderData = await OrderService.getOrderById(storeName, orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, storeName]);

  return { order, loading, error };
}; 