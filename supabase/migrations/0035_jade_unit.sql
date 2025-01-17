-- Add variant_options column
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variant_options jsonb DEFAULT '[]'::jsonb;

-- Add helpful comment
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

    -- Raise an error if the structure is invalid
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid structure for variant_options';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
