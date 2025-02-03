import { supabase } from '@/lib/supabase';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  accepts_marketing: boolean;
  loyalty_points: number;
  tier_id: string | null;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const CustomerService = {
  async getCustomers(storeName: string): Promise<Customer[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          points_transactions(*),
          customer_tiers (
            id,
            name,
            description,
            rewards_multiplier,
            discount_percentage
          )
        `)
        .eq('auth_id', user.id)
        .eq('store_name', storeName)
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No data returned from Supabase');
        return [];
      }

      return data; // Wrap single result in array since interface expects Customer[]
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw error;
    }
  },

  async getCustomerTiers(storeName: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('customer_tiers')
        .select('*')
        .eq('store_name', storeName)
        .order('rewards_multiplier', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch customer tiers:', error);
      throw error;
    }
  }
};
