-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert categories for their store" ON product_categories;
DROP POLICY IF EXISTS "Users can update their store's categories" ON product_categories;
DROP POLICY IF EXISTS "Users can delete their store's categories" ON product_categories;
DROP POLICY IF EXISTS "Users can view their store's categories" ON product_categories;

-- Create a single policy for authenticated users to manage their store's categories
CREATE POLICY "Users can manage their store's categories"
  ON product_categories
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
      AND profiles.id = auth.uid()
    )
  );

-- Create a policy for public read access
CREATE POLICY "Public users can view categories"
  ON product_categories
  FOR SELECT
  USING (true);

-- Grant necessary permissions
GRANT ALL ON TABLE product_categories TO authenticated;
GRANT SELECT ON TABLE product_categories TO anon;