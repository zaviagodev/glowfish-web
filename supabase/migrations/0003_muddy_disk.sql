/*
  # Update products table for proper category relationships

  1. Changes
    - Remove existing category columns (category_id, category_name)
    - Add new category_id column referencing product_categories table
    - Add foreign key constraint with ON DELETE SET NULL
    - Update indexes for category lookups

  2. Security
    - No changes to RLS policies needed as existing ones cover the new relationship
*/

-- Remove existing category columns and add new reference
ALTER TABLE products 
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS category_name,
  ADD COLUMN category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL;

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);

-- Update product transformer to handle new category relationship
COMMENT ON TABLE products IS 'Products table with proper category relationships';