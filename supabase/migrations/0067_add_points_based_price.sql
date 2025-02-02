-- Add points_based_price column to products table
ALTER TABLE products
ADD COLUMN points_based_price INTEGER,
ADD COLUMN is_reward BOOLEAN DEFAULT false,
ADD COLUMN is_gift_card BOOLEAN DEFAULT false;

-- Add points_based_price column to product_variants table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'product_variants' 
                  AND column_name = 'points_based_price') THEN
        ALTER TABLE product_variants
        ADD COLUMN points_based_price INTEGER;
    END IF;
END $$;

-- Update trigger function to use variant_options check
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
      points_based_price,
      quantity,
      options,
      status
    ) VALUES (
      NEW.id,
      NEW.name,
      NEW.sku,
      NEW.price,
      NEW.compare_at_price,
      NEW.points_based_price,
      CASE WHEN NEW.track_quantity THEN 0 ELSE NULL END,
      '[]'::jsonb,
      'active'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION create_default_variant IS 'Creates a default variant for products without variant options';
