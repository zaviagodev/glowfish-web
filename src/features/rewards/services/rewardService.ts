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
      )
    `)
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