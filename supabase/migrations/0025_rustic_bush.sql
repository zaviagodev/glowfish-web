/*
  # Add customer tier foreign key

  1. Changes
    - Add foreign key constraint from customers.tier_id to customer_tiers.id
    - Add store_name check to ensure tiers belong to same store as customer
    - Add index for faster tier lookups

  2. Security
    - Ensure RLS policies handle tier relationships correctly
*/

-- Add a unique constraint to the customer_tiers table
ALTER TABLE customer_tiers
  ADD CONSTRAINT customer_tiers_unique_id_store
  UNIQUE (id, store_name);

-- Add foreign key constraint with store check
ALTER TABLE customers
  DROP CONSTRAINT IF EXISTS customers_tier_id_fkey,
  ADD CONSTRAINT customers_tier_id_fkey 
    FOREIGN KEY (tier_id, store_name) 
    REFERENCES customer_tiers(id, store_name) 
    ON DELETE SET NULL;

-- Add composite index for efficient lookups
CREATE INDEX IF NOT EXISTS customers_tier_store_idx 
  ON customers(tier_id, store_name);

-- Update RLS policies to handle tier relationships
CREATE POLICY "Users can view their store's customer tiers"
  ON customer_tiers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = customer_tiers.store_name
      AND profiles.id = auth.uid()
    )
  );

-- Add helpful comment
COMMENT ON CONSTRAINT customers_tier_id_fkey ON customers IS 
  'Ensures customers can only be assigned to tiers from their store';