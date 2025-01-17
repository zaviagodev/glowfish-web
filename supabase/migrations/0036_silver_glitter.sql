-- Remove has_variants column and related constraints
ALTER TABLE products
  DROP COLUMN IF EXISTS has_variants,
  DROP CONSTRAINT IF EXISTS valid_variant_options;

-- Update trigger function to handle variants without has_variants flag
CREATE OR REPLACE FUNCTION create_default_variant()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default variant if no variant options are defined
  IF NEW.variant_options IS NULL OR NEW.variant_options = '[]'::jsonb THEN
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