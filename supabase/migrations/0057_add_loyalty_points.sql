-- Add loyalty points column to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS loyalty_points numeric DEFAULT 0 NOT NULL;

-- Create function to update loyalty points
CREATE OR REPLACE FUNCTION update_customer_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id uuid;
  v_total_points numeric;
  v_adjust_points numeric;
BEGIN
  -- Get customer_id from the points transaction
  v_customer_id := NEW.customer_id;

  -- Check if this is an adjust type transaction
  IF NEW.type = 'adjust' THEN
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for points transactions
DROP TRIGGER IF EXISTS update_loyalty_points_trigger ON points_transactions;
CREATE TRIGGER update_loyalty_points_trigger
  AFTER INSERT OR UPDATE OR DELETE ON points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_loyalty_points();

-- Add helpful comments
COMMENT ON COLUMN customers.loyalty_points IS 'Current balance of loyalty points for the customer';
COMMENT ON FUNCTION update_customer_loyalty_points IS 'Updates customer loyalty points when points_transactions change';