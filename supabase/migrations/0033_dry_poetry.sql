-- Remove store_name column and related constraints
ALTER TABLE product_variants
  DROP CONSTRAINT IF EXISTS product_variants_store_name_fkey,
  DROP CONSTRAINT IF EXISTS product_variants_store_name_sku_key,
  DROP COLUMN IF EXISTS store_name;

-- Add unique constraint for SKU at product level
ALTER TABLE product_variants
  ADD CONSTRAINT product_variants_product_id_sku_key 
  UNIQUE(product_id, sku);

-- Update RLS policies to use product relationship
DROP POLICY IF EXISTS "Users can manage their store's variants" ON product_variants;
DROP POLICY IF EXISTS "Public users can view active variants" ON product_variants;

CREATE POLICY "Users can manage their store's variants"
  ON product_variants
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.store_name = products.store_name
        AND profiles.id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.store_name = products.store_name
        AND profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Public users can view active variants"
  ON product_variants
  FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND products.status = 'active'
    )
  );

-- Update default variant trigger
CREATE OR REPLACE FUNCTION create_default_variant()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create default variant if product doesn't have variants enabled
  IF NOT NEW.has_variants THEN
    INSERT INTO product_variants (
      product_id,
      name,
      sku,
      price,
      compare_at_price,
      quantity,
      options,
      status
    ) VALUES (
      NEW.id,
      NEW.name,
      NEW.sku,
      NEW.price,
      NEW.compare_at_price,
      CASE WHEN NEW.track_quantity THEN 0 ELSE NULL END,
      '[]'::jsonb,
      'active'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON CONSTRAINT product_variants_product_id_sku_key ON product_variants IS 'Ensures SKUs are unique within each product';