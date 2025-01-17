-- Add customer tier relation
ALTER TABLE customers
  ADD COLUMN tier_id uuid REFERENCES customer_tiers(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX customers_tier_id_idx ON customers(tier_id);

-- Add comment explaining the relationship
COMMENT ON COLUMN customers.tier_id IS 'Reference to the customer tier. A customer can only belong to one tier at a time.';