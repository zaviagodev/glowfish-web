-- Add variant_id column and update foreign key
ALTER TABLE order_items
  ADD COLUMN variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL;

-- Update existing order_items to use default variants
UPDATE order_items oi
SET variant_id = (
  SELECT id FROM product_variants pv 
  WHERE pv.product_id = oi.product_id 
  LIMIT 1
);

-- Make variant_id required for new records
ALTER TABLE order_items
  ALTER COLUMN variant_id SET NOT NULL,
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey,
  DROP COLUMN product_id;

-- Add index for variant lookups
CREATE INDEX order_items_variant_id_idx ON order_items(variant_id);
