-- Add shipping settings columns
ALTER TABLE store_settings
ADD COLUMN fixed_shipping_rate_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN fixed_shipping_rate_amount numeric DEFAULT 0,
ADD COLUMN shipping_options jsonb DEFAULT '[]'::jsonb;

-- Add comments
COMMENT ON COLUMN store_settings.fixed_shipping_rate_enabled IS 'Whether to use fixed rate shipping';
COMMENT ON COLUMN store_settings.fixed_shipping_rate_amount IS 'Fixed shipping rate amount';
COMMENT ON COLUMN store_settings.shipping_options IS 'Array of shipping options with id, name, rate, and is_default';

-- Add constraint for fixed_shipping_rate_amount
ALTER TABLE store_settings
ADD CONSTRAINT fixed_shipping_rate_amount_non_negative CHECK (fixed_shipping_rate_amount >= 0);

-- Create function to validate shipping options
CREATE OR REPLACE FUNCTION validate_shipping_options()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if shipping_options is an array
  IF jsonb_typeof(NEW.shipping_options) != 'array' THEN
    RAISE EXCEPTION 'shipping_options must be an array';
  END IF;

  -- Validate each shipping option
  FOR i IN 0..jsonb_array_length(NEW.shipping_options) - 1 LOOP
    -- Check required fields
    IF NOT (
      NEW.shipping_options[i] ? 'id' AND
      NEW.shipping_options[i] ? 'name' AND
      NEW.shipping_options[i] ? 'rate' AND
      NEW.shipping_options[i] ? 'is_default'
    ) THEN
      RAISE EXCEPTION 'Each shipping option must have id, name, rate, and is_default fields';
    END IF;

    -- Check rate is non-negative
    IF (NEW.shipping_options[i]->>'rate')::numeric < 0 THEN
      RAISE EXCEPTION 'Shipping rate must be non-negative';
    END IF;

    -- Check is_default is boolean
    IF jsonb_typeof(NEW.shipping_options[i]->'is_default') != 'boolean' THEN
      RAISE EXCEPTION 'is_default must be a boolean';
    END IF;
  END LOOP;

  -- Check that exactly one option is default
  IF ((SELECT COUNT(*) FROM jsonb_array_elements(NEW.shipping_options)) > 0) AND NEW.fixed_shipping_rate_enabled = false THEN
    IF (
      SELECT COUNT(*)
      FROM jsonb_array_elements(NEW.shipping_options)
      WHERE (value->>'is_default')::boolean = true
    ) != 1 THEN
      RAISE EXCEPTION 'Exactly one shipping option must be marked as default';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the shipping options function
CREATE OR REPLACE FUNCTION get_shipping_options(store text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    store_settings record;
    result jsonb;
BEGIN
    -- Get store settings
    SELECT * INTO store_settings
    FROM store_settings
    WHERE store_name = store;

    -- If no settings found, return null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Initialize result
    result = jsonb_build_object(
        'fixed_rate', NULL,
        'options', NULL
    );

    -- Add fixed rate details if enabled
    IF store_settings.fixed_shipping_rate_enabled THEN
        result = jsonb_set(
            result,
            '{fixed_rate}',
            jsonb_build_object(
                'enabled', true,
                'amount', store_settings.fixed_shipping_rate_amount
            )
        );
    ELSE
        -- Add shipping options if fixed rate is disabled
        result = jsonb_set(
            result,
            '{options}',
            COALESCE(store_settings.shipping_options, '[]'::jsonb)
        );
    END IF;

    RETURN result;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_shipping_options TO public;

-- Add helpful comment
COMMENT ON FUNCTION public.get_shipping_options IS 'Get shipping options (fixed rate or multiple options) for a store'; 

-- Create trigger
CREATE TRIGGER validate_shipping_options_trigger
  BEFORE INSERT OR UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION validate_shipping_options(); 