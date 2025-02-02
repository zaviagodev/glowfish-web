-- Update function to include points_discount and sum_applied_coupons_discount in total calculation
CREATE OR REPLACE FUNCTION revalidate_applied_coupons()
RETURNS TRIGGER AS $$
DECLARE
  v_coupon record;
  v_valid_coupons jsonb := '[]'::jsonb;
  v_coupon_entry jsonb;
  v_discount numeric := 0;
  v_total_discount numeric := 0;
BEGIN  
  -- If no coupons applied, reset totals and return
  IF NEW.applied_coupons IS NULL OR jsonb_array_length(NEW.applied_coupons) = 0 THEN
    NEW.applied_coupons := '[]'::jsonb;
    -- Updated total calculation
    NEW.total := NEW.subtotal + NEW.shipping + NEW.tax - NEW.discount - COALESCE(NEW.points_discount, 0);
    RETURN NEW;
  END IF;

  -- Process each coupon in the applied_coupons array
  FOR v_coupon_entry IN SELECT * FROM jsonb_array_elements(NEW.applied_coupons)
  LOOP
    -- Get the coupon details
    SELECT *
    INTO v_coupon
    FROM coupons
    WHERE store_name = NEW.store_name
    AND code = v_coupon_entry->>'code'
    AND status = 'active'
    AND start_date <= CURRENT_TIMESTAMP
    AND end_date > CURRENT_TIMESTAMP
    AND (usage_limit IS NULL OR usage_count < usage_limit);

    -- If coupon is valid, calculate discount and add to valid coupons
    IF FOUND THEN
      -- Calculate discount based on coupon type
      CASE v_coupon.type
        WHEN 'percentage' THEN
          v_discount := ROUND((NEW.subtotal * v_coupon.value / 100)::numeric, 2);
          -- Apply max discount if specified
          IF v_coupon.max_discount_amount IS NOT NULL THEN
            v_discount := LEAST(v_discount, v_coupon.max_discount_amount);
          END IF;
        WHEN 'fixed' THEN
          v_discount := v_coupon.value;
        WHEN 'shipping' THEN
          v_discount := NEW.shipping;
        ELSE
          v_discount := 0;
      END CASE;

      -- Check minimum purchase amount if specified
      IF v_coupon.min_purchase_amount IS NULL OR NEW.subtotal >= v_coupon.min_purchase_amount THEN
        -- Add to valid coupons array
        v_valid_coupons := v_valid_coupons || jsonb_build_object(
          'code', v_coupon.code,
          'type', v_coupon.type,
          'value', v_coupon.value,
          'discount', v_discount
        );
        
        v_total_discount := v_total_discount + v_discount;
      END IF;
    END IF;
  END LOOP;

  -- Update the order with valid coupons and recalculated total
  NEW.applied_coupons := v_valid_coupons;
  -- Updated total calculation including points_discount
  NEW.total := NEW.subtotal + NEW.shipping + NEW.tax - v_total_discount - NEW.discount - COALESCE(NEW.points_discount, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION revalidate_applied_coupons IS 'Revalidates and recalculates applied coupons and total when an order is created or updated, including points discount in the calculation'; 