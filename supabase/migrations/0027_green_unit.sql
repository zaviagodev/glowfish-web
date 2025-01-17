-- Update the check_tier_requirements function with proper ELSE clauses
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
          ELSE
            meets_requirements := false;
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
          ELSE
            meets_requirements := false;
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
          ELSE
            meets_requirements := false;
        END CASE;

      ELSE
        -- Invalid requirement type
        meets_requirements := false;
    END CASE;

    -- Exit early if any requirement is not met
    IF NOT meets_requirements THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN meets_requirements;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION check_tier_requirements IS 'Checks if a customer meets the requirements for a specific tier, with proper handling of all cases';