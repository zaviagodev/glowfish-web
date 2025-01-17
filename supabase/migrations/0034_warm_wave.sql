/*
  # Add has_variants column to products table

  1. Schema Changes
    - Add has_variants column to products table
    - Add variant_options column to store variant configuration
  
  2. Changes
    - Add has_variants boolean column with default false
    - Add variant_options JSONB column for storing option configurations
    - Add validation check for variant_options structure
*/

-- Add has_variants and variant_options columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS has_variants boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS variant_options jsonb DEFAULT '[]'::jsonb;

-- Add index for variant queries
CREATE INDEX IF NOT EXISTS products_has_variants_idx ON products(has_variants) WHERE has_variants = true;

-- Add helpful comment
COMMENT ON COLUMN products.has_variants IS 'Indicates if the product has multiple variants';
COMMENT ON COLUMN products.variant_options IS 'Configuration for variant options (e.g., size, color)';

-- Create function to validate variant_options
CREATE OR REPLACE FUNCTION validate_variant_options()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.variant_options IS NOT NULL THEN
    PERFORM bool_and(
      jsonb_typeof(opt) = 'object' AND
      opt ? 'id' AND
      opt ? 'name' AND
      opt ? 'values' AND
      opt ? 'position' AND
      jsonb_typeof(opt->'values') = 'array'
    )
    FROM jsonb_array_elements(NEW.variant_options) opt;

    -- If the validation fails, raise an error
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid structure for variant_options';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to enforce validation
CREATE TRIGGER validate_variant_options_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION validate_variant_options();