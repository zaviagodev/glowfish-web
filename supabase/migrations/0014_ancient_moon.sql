-- Function to ensure only one default address per type per customer
CREATE OR REPLACE FUNCTION maintain_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated address is being set as default
  IF NEW.is_default THEN
    -- Remove default status from other addresses of the same type for this customer
    UPDATE customer_addresses
    SET is_default = false
    WHERE customer_id = NEW.customer_id
      AND type = NEW.type
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for insert/update operations
DROP TRIGGER IF EXISTS ensure_single_default_address ON customer_addresses;
CREATE TRIGGER ensure_single_default_address
  BEFORE INSERT OR UPDATE OF is_default
  ON customer_addresses
  FOR EACH ROW
  EXECUTE FUNCTION maintain_single_default_address();

-- Add comment explaining the trigger
COMMENT ON TRIGGER ensure_single_default_address ON customer_addresses IS 
  'Ensures only one default address per type (shipping/billing) per customer';