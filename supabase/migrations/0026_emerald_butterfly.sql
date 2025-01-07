-- Function to calculate tier weightage
CREATE OR REPLACE FUNCTION calculate_tier_weightage(
  rewards_multiplier numeric,
  discount_percentage numeric,
  free_shipping boolean,
  priority_support boolean,
  early_access boolean
) RETURNS numeric AS $$
BEGIN
  RETURN (
    rewards_multiplier * 3 +
    discount_percentage * 5 +
    CASE WHEN free_shipping THEN 5 ELSE 0 END +
    CASE WHEN priority_support THEN 2 ELSE 0 END +
    CASE WHEN early_access THEN 1 ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if customer meets tier requirements
CREATE OR REPLACE FUNCTION check_tier_requirements(
  p_customer_id uuid,
  p_requirements jsonb
) RETURNS boolean AS $$
DECLARE
  requirement jsonb;
  meets_requirements boolean := true;
  total_spent numeric;
  order_count integer;
  last_order_days integer;
BEGIN
  -- Return true if no requirements
  IF p_requirements IS NULL OR p_requirements = '[]'::jsonb THEN
    RETURN true;
  END IF;

  -- Check each requirement
  FOR requirement IN SELECT * FROM jsonb_array_elements(p_requirements)
  LOOP
    -- Skip if not enabled
    IF NOT (requirement->>'enabled')::boolean THEN
      CONTINUE;
    END IF;

    CASE requirement->>'type'
      WHEN 'total_spent' THEN
        -- Calculate total spent from delivered orders
        SELECT COALESCE(SUM(total), 0)
        INTO total_spent
        FROM orders
        WHERE customer_id = p_customer_id
        AND status = 'delivered';

        -- Check against requirement
        CASE requirement->>'operator'
          WHEN 'greater_than' THEN
            meets_requirements := total_spent > (requirement->>'value')::numeric;
          WHEN 'less_than' THEN
            meets_requirements := total_spent < (requirement->>'value')::numeric;
          WHEN 'equal_to' THEN
            meets_requirements := total_spent = (requirement->>'value')::numeric;
        END CASE;

      WHEN 'order_count' THEN
        -- Count delivered orders
        SELECT COUNT(*)
        INTO order_count
        FROM orders
        WHERE customer_id = p_customer_id
        AND status = 'delivered';

        -- Check against requirement
        CASE requirement->>'operator'
          WHEN 'greater_than' THEN
            meets_requirements := order_count > (requirement->>'value')::integer;
          WHEN 'less_than' THEN
            meets_requirements := order_count < (requirement->>'value')::integer;
          WHEN 'equal_to' THEN
            meets_requirements := order_count = (requirement->>'value')::integer;
        END CASE;

      WHEN 'last_order' THEN
        -- Calculate days since last order
        SELECT EXTRACT(DAY FROM NOW() - MAX(created_at))::integer
        INTO last_order_days
        FROM orders
        WHERE customer_id = p_customer_id
        AND status = 'delivered';

        -- If no orders, use maximum integer
        IF last_order_days IS NULL THEN
          last_order_days := 2147483647;
        END IF;

        -- Check against requirement
        CASE requirement->>'operator'
          WHEN 'greater_than' THEN
            meets_requirements := last_order_days > (requirement->>'value')::integer;
          WHEN 'less_than' THEN
            meets_requirements := last_order_days < (requirement->>'value')::integer;
        END CASE;
    END CASE;

    -- Exit early if any requirement is not met
    IF NOT meets_requirements THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN meets_requirements;
END;
$$ LANGUAGE plpgsql;

-- Main procedure to reevaluate customer tier
CREATE OR REPLACE PROCEDURE reevaluate_customer_tier(order_id uuid)
LANGUAGE plpgsql
AS $$
DECLARE
  v_order record;
  v_tier record;
  v_current_tier_id uuid;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM orders
  WHERE id = order_id AND status = 'delivered';

  -- Exit if order not found or not delivered
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Get current tier
  SELECT tier_id INTO v_current_tier_id
  FROM customers
  WHERE id = v_order.customer_id;

  -- Get all tiers for the store, ordered by weightage
  FOR v_tier IN (
    SELECT *
    FROM customer_tiers
    WHERE store_name = v_order.store_name
    AND status = 'active'
    ORDER BY calculate_tier_weightage(
      rewards_multiplier,
      discount_percentage,
      free_shipping,
      priority_support,
      early_access
    ) DESC
  )
  LOOP
    -- Check if customer meets requirements
    IF check_tier_requirements(v_order.customer_id, v_tier.requirements) THEN
      -- Update customer tier if different
      IF v_current_tier_id IS DISTINCT FROM v_tier.id THEN
        UPDATE customers
        SET 
          tier_id = v_tier.id,
          updated_at = NOW()
        WHERE id = v_order.customer_id;
      END IF;
      
      -- Exit after finding first matching tier
      RETURN;
    END IF;
  END LOOP;

  -- If no tier matches, remove current tier
  IF v_current_tier_id IS NOT NULL THEN
    UPDATE customers
    SET 
      tier_id = NULL,
      updated_at = NOW()
    WHERE id = v_order.customer_id;
  END IF;
END;
$$;

-- Trigger function to handle order status changes
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status changed to delivered
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Call reevaluation procedure
    CALL reevaluate_customer_tier(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_status_change();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_tier_weightage TO authenticated;
GRANT EXECUTE ON FUNCTION check_tier_requirements TO authenticated;
GRANT EXECUTE ON PROCEDURE reevaluate_customer_tier TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION calculate_tier_weightage IS 'Calculates weightage score for customer tiers based on benefits';
COMMENT ON FUNCTION check_tier_requirements IS 'Checks if a customer meets the requirements for a specific tier';
COMMENT ON PROCEDURE reevaluate_customer_tier IS 'Reevaluates and updates customer tier when order status changes to delivered';
COMMENT ON FUNCTION handle_order_status_change IS 'Trigger function to handle order status changes and initiate tier reevaluation';