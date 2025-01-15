import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/auth';

export interface CustomerProfile {
  id: string;
  store_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  total_points: number;
  tier_id: string | null;
  accepts_marketing: boolean;
  tags: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomer = () => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true);
        
        // Get authenticated user profile
        const profile = await getUserProfile();
        if (!profile) {
          throw new Error('User not authenticated');
        }

        // Fetch customer data
        const { data, error: customerError } = await supabase
          .from('customers')
          .select(`
            *,
            points_transactions(*)
          `)
          .eq('auth_id', profile.id)
          .single();

        if (customerError) throw customerError;
        if (!data) throw new Error('Customer not found');

        setCustomer(data);
      } catch (err) {
        console.error('Error loading customer:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, []);

  // Function to refresh customer data
  const refreshCustomer = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile();
      if (!profile) {
        throw new Error('User not authenticated');
      }

      const { data, error: customerError } = await supabase
        .from('customers')
        .select(`
          *,
            points_transactions(*)
        `)
        .eq('auth_id', profile.id)
        .single();

      if (customerError) throw customerError;
      if (!data) throw new Error('Customer not found');

      setCustomer(data);
    } catch (err) {
      console.error('Error refreshing customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh customer data');
    } finally {
      setLoading(false);
    }
  };

  return { customer, loading, error, refreshCustomer };
};