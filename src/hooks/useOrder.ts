import { useState, useEffect } from 'react';
import { OrderService, Order } from '@/services/orderService';
import { useStore } from '@/hooks/useStore';
import { useCustomer } from '@/hooks/useCustomer';

export const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeName } = useStore();
  const { customer } = useCustomer();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!storeName || !orderId || !customer?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const orderData = await OrderService.getOrderById(storeName, orderId, customer.id);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, storeName, customer?.id]);

  return { order, loading, error };
}; 