import { useState, useEffect } from "react";
import { shippingService, ShippingOption, ShippingMethods } from "../services/shippingService";
import { CartItem } from "@/lib/cart";
import { useStore } from "@/hooks/useStore";
import { supabase } from "@/lib/supabase";

export function useShipping(items: CartItem[]) {
  const { storeName } = useStore();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethods>({ fixed_rate: null, options: null });
  const [selectedMethod, setSelectedMethod] = useState<ShippingOption | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        console.log("Fetching shipping methods for store:", storeName);
        setLoading(true);
        const methods = await shippingService.getShippingMethods(storeName);
        console.log("Received shipping methods:", methods);
        setShippingMethods(methods);

        // Check if all items are events
        let hasPhysicalProducts = false;
        for (const item of items) {
          const { data: variant, error: variantError } = await supabase
            .from("product_variants")
            .select("product_id")
            .eq("id", item.variantId)
            .single();

          if (variantError) {
            console.log("Variant error, skipping:", variantError);
            continue;
          }

          if (variant) {
            // Check if this product is an event
            const { data: event, error: eventError } = await supabase
              .from("events")
              .select("id")
              .eq("product_id", variant.product_id)
              .single();

            if (!event) {
              // If there's no event entry, it's a physical product
              hasPhysicalProducts = true;
              break;
            }
          }
        }

        // If there are no physical products, set shipping cost to 0
        if (!hasPhysicalProducts) {
          console.log("No physical products found, setting shipping cost to 0");
          setShippingCost(0);
          return;
        }
        
        // Handle fixed rate shipping
        if (methods.fixed_rate?.enabled) {
          console.log("Fixed rate shipping enabled:", methods.fixed_rate);
          setShippingCost(methods.fixed_rate.amount);
          return;
        }
        
        // Handle multiple shipping options
        if (methods.options?.length) {
          console.log("Multiple shipping options available:", methods.options);
          // Select the default option or the first one
          const defaultOption = methods.options.find(option => option.is_default) || methods.options[0];
          console.log("Selected shipping option:", defaultOption);
          setSelectedMethod(defaultOption);
          setShippingCost(defaultOption.rate);
        } else {
          console.log("No shipping options available");
        }
      } catch (err) {
        console.error("Error fetching shipping methods:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch shipping methods"));
      } finally {
        setLoading(false);
      }
    };

    if (storeName) {
      fetchShippingMethods();
    }
  }, [items, storeName]);

  const selectShippingMethod = async (methodId: string) => {
    try {
      console.log("Selecting shipping method:", methodId);
      // If fixed rate shipping is enabled, we don't need to select a method
      if (shippingMethods.fixed_rate?.enabled) {
        console.log("Fixed rate shipping is enabled, no need to select method");
        return;
      }

      const method = shippingMethods.options?.find((option: ShippingOption) => option.id === methodId);
      if (!method) {
        throw new Error("Shipping method not found");
      }

      console.log("Selected shipping method:", method);
      setSelectedMethod(method);
      setShippingCost(method.rate);
    } catch (err) {
      console.error("Error selecting shipping method:", err);
      setError(err instanceof Error ? err : new Error("Failed to select shipping method"));
    }
  };

  return {
    shippingMethods,
    selectedMethod,
    shippingCost,
    loading,
    error,
    selectShippingMethod,
  };
} 