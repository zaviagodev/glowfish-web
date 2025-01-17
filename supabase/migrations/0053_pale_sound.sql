-- Add coupons array to orders table
ALTER TABLE orders
  ADD COLUMN applied_coupons jsonb DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION validate_applied_coupons()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.applied_coupons IS NOT NULL THEN
    IF jsonb_typeof(NEW.applied_coupons) <> 'array' THEN
      RAISE EXCEPTION 'applied_coupons must be a JSON array';
    END IF;

    PERFORM jsonb_array_elements(NEW.applied_coupons) AS elem
    WHERE NOT (
      elem ? 'code' AND
      elem ? 'type' AND
      elem ? 'value' AND
      elem ? 'discount'
    );
    IF FOUND THEN
      RAISE EXCEPTION 'Invalid coupon structure in applied_coupons';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_applied_coupons_trigger
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION validate_applied_coupons();

-- Add index for coupon queries
CREATE INDEX orders_applied_coupons_idx ON orders USING gin(applied_coupons);

-- Add helpful comment
COMMENT ON COLUMN orders.applied_coupons IS 'Array of applied coupons with their calculated discounts';