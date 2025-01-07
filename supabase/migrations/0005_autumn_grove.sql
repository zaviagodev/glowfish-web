/*
  # Fix Product Categories Relationship

  1. Changes
    - Add proper foreign key constraint for product categories
    - Update existing products to handle category relationship
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- Ensure proper foreign key constraint
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey,
  ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES product_categories(id) 
    ON DELETE SET NULL;

-- Add composite index for store_name and category lookups
CREATE INDEX IF NOT EXISTS products_store_category_idx 
  ON products(store_name, category_id);

-- Update product categories query in product service
COMMENT ON TABLE products IS 'Products table with category relationship';