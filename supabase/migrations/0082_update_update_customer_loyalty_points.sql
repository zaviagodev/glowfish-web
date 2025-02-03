-- Create function to update loyalty points
CREATE OR REPLACE FUNCTION update_customer_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id uuid;
  v_total_points numeric;
  v_adjust_points numeric;
BEGIN
  -- Get customer_id from the points transaction
  v_customer_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.customer_id
    ELSE NEW.customer_id
  END;

  -- Check if this is an adjust type transaction
  IF TG_OP != 'DELETE' AND NEW.type = 'adjust' THEN
    v_total_points := NEW.points;
  ELSE
    -- Calculate total points for the customer excluding adjust transactions
    SELECT COALESCE(SUM(
      CASE 
        WHEN type = 'earn' THEN points
        WHEN type = 'redeem' OR type = 'expire' THEN -points
      END
    ), 0)
    INTO v_total_points
    FROM points_transactions
    WHERE customer_id = v_customer_id
    AND type != 'adjust';
  END IF;

  -- Update customer's loyalty points
  UPDATE customers
  SET 
    loyalty_points = v_total_points,
    updated_at = NOW()
  WHERE id = v_customer_id;

  RETURN CASE
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql;