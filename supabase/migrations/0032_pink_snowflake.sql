-- Create product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  quantity integer DEFAULT 0,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT product_variants_status_check CHECK (status IN ('active', 'inactive')),
  CONSTRAINT product_variants_quantity_check CHECK (quantity >= 0),
  CONSTRAINT product_variants_price_check CHECK (price >= 0),
  CONSTRAINT product_variants_compare_price_check CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  UNIQUE(store_name, sku)
);

-- Create indexes
CREATE INDEX product_variants_product_id_idx ON product_variants(product_id);
CREATE INDEX product_variants_store_name_idx ON product_variants(store_name);
CREATE INDEX product_variants_status_idx ON product_variants(status);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create policies

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

-- Function to create default variant
CREATE OR REPLACE FUNCTION create_default_variant()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create default variant if product doesn't have variants enabled
  IF NOT NEW.has_variants THEN
    INSERT INTO product_variants (
      product_id,
      store_name,
      name,
      sku,
      price,
      compare_at_price,
      quantity,
      options,
      status
    ) VALUES (
      NEW.id,
      NEW.store_name,
      NEW.name,
      NEW.sku,
      NEW.price,
      NEW.compare_at_price,
      CASE WHEN NEW.track_quantity THEN NEW.quantity ELSE NULL END,
      '[]'::jsonb,
      'active'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new products
CREATE TRIGGER create_default_variant_trigger
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_default_variant();

-- Remove quantity column from products as it's now managed in variants
ALTER TABLE products 
  DROP COLUMN IF EXISTS quantity;

-- Grant permissions
GRANT ALL ON TABLE product_variants TO authenticated;
GRANT SELECT ON TABLE product_variants TO anon;

-- Add helpful comments
COMMENT ON TABLE product_variants IS 'Stores product variants with individual pricing and inventory';
COMMENT ON COLUMN product_variants.options IS 'JSON array of option name-value pairs';
COMMENT ON TRIGGER create_default_variant_trigger ON products IS 'Creates a default variant for products without variations';