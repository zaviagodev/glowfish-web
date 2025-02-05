import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/useStore';
import { PostgrestResponse } from '@supabase/supabase-js';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  variant_id: string;
  product_variants: {
    name: string;
    options: {
      name: string;
      value: string;
    }[];
    product: {
      id: string;
      name: string;
      description: string;
      product_images: {
        url: string;
      }[];
    };
  };
}

interface DbOrder {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  points_discount: number;
  loyalty_points_used: number;
  created_at: string;
  customer_id: string;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  order_items: OrderItem[];
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  points_discount: number;
  loyalty_points_used: number;
  created_at: string;
  customer_id: string;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    variant_id: string;
    product_variants: {
      name: string;
      options: {
        name: string;
        value: string;
      }[];
      product: {
        id: string;
        name: string;
        description: string;
        image: string;
      };
    };
  }[];
}

export const OrderService = {
  async getOrders(
    storeName: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ orders: Order[]; total: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate offset based on page and limit
      const offset = (page - 1) * limit;

      // First get total count
      const { count: total } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .eq('store_name', storeName);

      // Then get paginated data
      const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            customer:customers (*),
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
        .eq('customer_id', user.id)
        .eq('store_name', storeName)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No data returned from Supabase');
        return { orders: [], total: 0 };
      }

      // Transform the data to match the Order interface
      const transformedOrders = (data as unknown as DbOrder[]).map((order): Order => ({
        id: order.id,
        status: order.status,
        total_amount: order.total || 0,
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        discount: order.discount || 0,
        points_discount: order.points_discount || 0,
        loyalty_points_used: order.loyalty_points_used || 0,
        created_at: order.created_at,
        customer_id: order.customer_id,
        customer: {
          id: order.customer.id,
          email: order.customer.email,
          first_name: order.customer.first_name,
          last_name: order.customer.last_name
        },
        order_items: order.order_items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.total,
          variant_id: item.variant_id,
          product_variants: {
            name: item.product_variants.name,
            options: item.product_variants.options,
            product: {
              id: item.product_variants.product.id,
              name: item.product_variants.product.name,
              description: item.product_variants.product.description,
              image: item.product_variants.product.product_images?.[0]?.url || '/placeholder-image.jpg'
            }
          }
        }))
      }));

      return { 
        orders: transformedOrders, 
        total: total || 0 
      };
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  },

  async getOrderById(
    storeName: string,
    orderId: string
  ): Promise<Order | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers (*),
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
        .eq('customer_id', user.id)
        .eq('store_name', storeName)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No order found with ID:', orderId);
        return null;
      }

      // Transform the data to match the Order interface
      const order = data as unknown as DbOrder;
      return {
        id: order.id,
        status: order.status,
        total_amount: order.total || 0,
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        discount: order.discount || 0,
        points_discount: order.points_discount || 0,
        loyalty_points_used: order.loyalty_points_used || 0,
        created_at: order.created_at,
        customer_id: order.customer_id,
        customer: {
          id: order.customer.id,
          email: order.customer.email,
          first_name: order.customer.first_name,
          last_name: order.customer.last_name
        },
        order_items: order.order_items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.total,
          variant_id: item.variant_id,
          product_variants: {
            name: item.product_variants.name,
            options: item.product_variants.options,
            product: {
              id: item.product_variants.product.id,
              name: item.product_variants.product.name,
              description: item.product_variants.product.description,
              image: item.product_variants.product.product_images?.[0]?.url || '/placeholder-image.jpg'
            }
          }
        }))
      };
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  }
}; 