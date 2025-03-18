import { supabase } from "@/lib/supabase";

export interface ShippingOption {
  id: string;
  name: string;
  rate: number;
  is_default: boolean;
}

export interface FixedRateShipping {
  enabled: boolean;
  amount: number;
}

export interface ShippingMethods {
  fixed_rate: FixedRateShipping | null;
  options: ShippingOption[] | null;
}

export const shippingService = {
  async getShippingMethods(storeName: string): Promise<ShippingMethods> {
    console.log("Calling get_shipping_options RPC for store:", storeName);
    const { data, error } = await supabase.rpc("get_shipping_options", {
      store: storeName,
    });

    if (error) {
      console.error("Error getting shipping options:", error);
      throw error;
    }

    console.log("Shipping options response:", data);
    return data || { fixed_rate: null, options: null };
  },

  async calculateShippingCost(
    storeName: string,
    methodId: string,
    items: Array<{ quantity: number; weight?: number }>
  ): Promise<number> {
    console.log("Calculating shipping cost for store:", storeName, "method:", methodId);
    const { data: shippingMethods, error: methodsError } = await supabase.rpc(
      "get_shipping_options",
      { store: storeName }
    );

    if (methodsError) {
      console.error("Error getting shipping methods for cost calculation:", methodsError);
      throw methodsError;
    }

    console.log("Shipping methods for cost calculation:", shippingMethods);

    // If fixed rate shipping is enabled, return the fixed amount
    if (shippingMethods?.fixed_rate?.enabled) {
      console.log("Using fixed rate shipping:", shippingMethods.fixed_rate);
      return shippingMethods.fixed_rate.amount;
    }

    // Otherwise, find the selected shipping option
    const selectedOption = shippingMethods?.options?.find(
      (option: ShippingOption) => option.id === methodId
    );

    if (!selectedOption) {
      console.error("Shipping method not found:", methodId);
      throw new Error("Shipping method not found");
    }

    console.log("Selected shipping option for cost:", selectedOption);
    return selectedOption.rate;
  },
}; 