/*
  # Fix Product Tags Schema and Relationships

  1. Changes
    - Add store_name to product_tags table for better querying and security
    - Update RLS policies for product tags
    - Add proper indexes and constraints

  2. Notes
    - This ensures tags are properly scoped to stores
    - Enables better tag management and security
*/

-- Add store_name to product_tags
ALTER TABLE product_tags
  ADD COLUMN IF NOT EXISTS store_name text REFERENCES profiles(store_name) ON DELETE CASCADE;

-- Update existing tags with store_name from products
UPDATE product_tags
SET store_name = products.store_name
FROM products
WHERE product_tags.product_id = products.id;

-- Make store_name NOT NULL after update
ALTER TABLE product_tags
  ALTER COLUMN store_name SET NOT NULL;

-- Add composite index for efficient querying
CREATE INDEX IF NOT EXISTS product_tags_store_product_idx 
  ON product_tags(store_name, product_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage their store's product tags" ON product_tags;
DROP POLICY IF EXISTS "Public users can view product tags" ON product_tags;

CREATE POLICY "Enable full access for authenticated users"
  ON product_tags
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_tags.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_tags.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Enable read access for all users"
  ON product_tags
  FOR SELECT
  USING (true);