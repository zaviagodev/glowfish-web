import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/useStore';
import { PostgrestResponse } from '@supabase/supabase-js';
import { Order, transformOrder, transformOrders } from '../transformers/orderTransformer';

export interface OrdersResponse {
  orders: Order[];
  total: number;
}

export const OrderService = {
  async getOrders(
    storeName: string, 
    page: number = 1, 
    limit: number = 10,
    customerId?: string,
    status?: string
  ): Promise<OrdersResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate offset based on page and limit
      const offset = (page - 1) * limit;

      // Build query for total count
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_name', storeName);

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Get total count
      const { count: total } = await query;

      // Build main query
      let ordersQuery = supabase
        .from('orders')
        .select(`
            id,
            status,
            total,
            subtotal,
            tax,
            shipping,
            discount,
            points_discount,
            loyalty_points_used,
            created_at,
            customer_id,
            shipping_details,
            customer:customers (
              id,
              email,
              first_name,
              last_name
            ),
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
                  id,
                  status,
                  description,
                  product_images (
                    id,
                    url,
                    alt,
                    position
                  )
                )
              )
            )
          )
        `)
        .eq('store_name', storeName);

      if (customerId) {
        ordersQuery = ordersQuery.eq('customer_id', customerId);
      }

      if (status && status !== 'all') {
        ordersQuery = ordersQuery.eq('status', status);
      }

      ordersQuery = ordersQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await ordersQuery;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No data returned from Supabase');
        return { orders: [], total: 0 };
      }

      return { 
        orders: transformOrders(data as any), 
        total: total || 0 
      };
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  },

  async getOrder(
    storeName: string,
    orderId: string,
    customerId?: string
  ): Promise<Order | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('orders')
        .select(`
          id,
          status,
          total,
          subtotal,
          tax,
          shipping,
          discount,
          points_discount,
          loyalty_points_used,
          created_at,
          customer_id,
          payment_details,
          shipping_details,
          customer:customers (
            id,
            email,
            first_name,
            last_name
          ),
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
                id,
                status,
                description,
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
        .eq('store_name', storeName)
        .eq('id', orderId);

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No order found with ID:', orderId);
        return null;
      }

      return transformOrder(data as any);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  }
}; 