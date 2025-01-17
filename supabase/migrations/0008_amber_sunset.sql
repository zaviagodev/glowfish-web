/*
  # Fix Product Categories Permissions

  1. Changes
    - Update RLS policies
    - Fix foreign key constraints
    - Add missing grants
*/

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage their store's categories" ON product_categories;
DROP POLICY IF EXISTS "Public users can view categories" ON product_categories;

CREATE POLICY "Enable full access for authenticated users"
  ON product_categories
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Enable read access for all users"
  ON product_categories
  FOR SELECT
  USING (true);

-- Fix foreign key constraints
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE products
  ADD CONSTRAINT products_category_id_fkey 
  FOREIGN KEY (category_id) 
  REFERENCES product_categories(id) 
  ON DELETE SET NULL;

-- Grant permissions
GRANT ALL ON TABLE product_categories TO authenticated;
GRANT SELECT ON TABLE product_categories TO anon;
-- GRANT USAGE ON SEQUENCE product_categories_id_seq TO authenticated;