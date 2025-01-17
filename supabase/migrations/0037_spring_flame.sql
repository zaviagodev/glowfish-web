-- Add variant_options column to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variant_options jsonb DEFAULT '[]'::jsonb;

-- Add helpful comment
COMMENT ON COLUMN products.variant_options IS 'Configuration for variant options (e.g., size, color)';