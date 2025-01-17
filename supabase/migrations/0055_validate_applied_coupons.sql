CREATE OR REPLACE FUNCTION validate_applied_coupons()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.applied_coupons IS NOT NULL THEN
    IF jsonb_typeof(NEW.applied_coupons) <> 'array' THEN
      RAISE EXCEPTION 'applied_coupons must be a JSON array';
    END IF;

    -- Check each element in the array
    FOR i IN 0..jsonb_array_length(NEW.applied_coupons) - 1 LOOP
      IF NOT (
        (NEW.applied_coupons->i) ? 'code' AND
        (NEW.applied_coupons->i) ? 'type' AND
        (NEW.applied_coupons->i) ? 'value' AND
        (NEW.applied_coupons->i) ? 'discount'
      ) THEN
        RAISE EXCEPTION 'Invalid coupon structure in applied_coupons';
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
