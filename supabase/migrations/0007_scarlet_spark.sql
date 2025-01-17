/*
  # Fix Category Relationship

  1. Changes
    - Add unique constraint for store categories
    - Update foreign key constraints
    - Add proper indexes
    - Update permissions
*/

-- Add unique constraint for store categories
ALTER TABLE product_categories
  ADD CONSTRAINT product_categories_store_name_id_key 
  UNIQUE (store_name, id);

-- Update foreign key constraint
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey,
  ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (store_name, category_id) 
    REFERENCES product_categories(store_name, id)
    ON DELETE SET NULL;

-- Add indexes for efficient lookups
CREATE INDEX IF NOT EXISTS products_category_id_idx 
  ON products(category_id);

CREATE INDEX IF NOT EXISTS products_store_category_idx 
  ON products(store_name, category_id);

-- Update permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Add helpful comments
COMMENT ON CONSTRAINT product_categories_store_name_id_key ON product_categories IS 
  'Ensures unique categories within each store';
COMMENT ON CONSTRAINT products_category_id_fkey ON products IS 
  'Links products to categories within the same store';