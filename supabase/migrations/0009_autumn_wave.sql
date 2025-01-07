/*
  # Add discount enabled flag to products

  1. Changes
    - Add has_discount column to products table to track if a product has an active discount
    - Update existing products to set has_discount based on compare_at_price

  2. Notes
    - This allows proper tracking of discount state separate from the compare_at_price value
    - Helps maintain discount state when editing products
*/

-- Add has_discount column
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS has_discount boolean DEFAULT false;

-- Update existing products
UPDATE products 
SET has_discount = CASE 
  WHEN compare_at_price IS NOT NULL AND compare_at_price > 0 THEN true 
  ELSE false 
END;

-- Add index for discount queries
CREATE INDEX IF NOT EXISTS products_has_discount_idx ON products(has_discount);