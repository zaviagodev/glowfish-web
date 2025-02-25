-- Add new columns and snapshot data
ALTER TABLE order_items
  ALTER COLUMN variant_id DROP NOT NULL,
  ADD COLUMN product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN variant_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN product_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Ensure foreign key constraint is correct
ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey,
  ADD CONSTRAINT order_items_variant_id_fkey 
    FOREIGN KEY (variant_id) 
    REFERENCES product_variants(id) 
    ON DELETE SET NULL;

-- Update existing records
UPDATE order_items oi
SET 
  product_id = pv.product_id,
  variant_snapshot = jsonb_build_object(
    'id', pv.id,
    'name', pv.name,
    'sku', pv.sku,
    'options', pv.options
  ),
  product_snapshot = jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'sku', p.sku
  )
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE oi.variant_id = pv.id;

-- Create trigger function to populate snapshot data
CREATE OR REPLACE FUNCTION populate_order_item_snapshots()
RETURNS TRIGGER AS $$
BEGIN
  -- Get variant and product data
  WITH variant_data AS (
    SELECT 
      pv.*,
      p.name as product_name,
      p.sku as product_sku
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = NEW.variant_id
  )
  SELECT 
    product_id,
    jsonb_build_object(
      'id', id,
      'name', name,
      'sku', sku,
      'options', options
    ),
    jsonb_build_object(
      'id', product_id,
      'name', product_name,
      'sku', product_sku
    )
  INTO 
    NEW.product_id,
    NEW.variant_snapshot,
    NEW.product_snapshot
  FROM variant_data;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER order_items_snapshot_trigger
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION populate_order_item_snapshots();

-- Add helpful comment
COMMENT ON FUNCTION populate_order_item_snapshots IS 'Automatically populates product and variant snapshot data when creating order items';