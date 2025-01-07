/*
  # Fix Category Relationship

  1. Changes
    - Add store_name to category relationship check
    - Update product_categories permissions
    - Add missing indexes
*/

-- Update foreign key constraint to include store_name check
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey,
  ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id, store_name) 
    REFERENCES product_categories(id, store_name) 
    ON DELETE SET NULL;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS products_category_store_idx 
  ON products(category_id, store_name);

-- Update permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;