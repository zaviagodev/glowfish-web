import { supabase } from "@/lib/supabase";

export interface Reward {
  id: string;
  name: string;
  description: string;
  location?: string;
  date?: string;
  product_images?: { url: string }[];
  product_variants?: {
    id: string;
    price: number;
    points_based_price: number;
  }[];
}

export const getRewards = async (): Promise<Reward[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        url
      ),
      product_variants (
        id,
        price,
        points_based_price
      ),
      events!left (*)
    `)
    .is("events", null)
    .eq("is_reward", true);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getRewardById = async (id: string): Promise<Reward | null> => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        url
      ),
      product_variants (
        id,
        price,
        points_based_price
      )
    `)
    .eq("id", id)
    .eq("is_reward", true)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export interface RewardOrder {
  id: string;
  store_name: string;
  customer_id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'processing';
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  payment_details: any;
  shipping_details: any;
  applied_coupons: any[];
  loyalty_points_rate: number;
  loyalty_points_used: number;
  points_discount: number;
  shipping_address_id: string;
  billing_address_id: string;
  shipping_option: any;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  order_items: {
    id: string;
    price: number;
    total: number;
    quantity: number;
    meta_data: {
      gift: boolean;
      event: boolean;
      reward: boolean;
    };
    variant_id: string;
    product_variant: {
      name: string;
      options: any[];
      product: {
        id: string;
        name: string;
        images: {
          alt: string;
          url: string;
          path: string;
          position: number;
        }[];
        status: string;
      };
    };
  }[];
  rewards: {
    id: string;
    code: string;
  }[];
}

export const getRewardOrders = async (): Promise<RewardOrder[]> => {
  const { data, error } = await supabase
    .from("reward_orders")
    .select(`
      *,
      rewards (
        id,
        code
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getRewardOrderById = async (id: string): Promise<RewardOrder | null> => {
  const { data, error } = await supabase
    .from("reward_orders")
    .select(`
      *,
      rewards (
        id,
        code
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}; 