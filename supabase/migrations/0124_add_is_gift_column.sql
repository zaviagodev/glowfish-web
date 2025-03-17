/*
  # Add is_gift column to products table

  1. Changes
    - Add is_gift column to products table with default value of false
*/

-- Add is_gift column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_gift boolean DEFAULT false;

-- Add helpful comment
COMMENT ON COLUMN products.is_gift IS 'Indicates if the product is a gift item (bought using points)'; 