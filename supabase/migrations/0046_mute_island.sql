-- Drop existing tables if they exist
DROP TABLE IF EXISTS campaign_product_rules;
DROP TABLE IF EXISTS campaign_conditions;

-- Add JSONB columns to campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS product_rules JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]'::jsonb;

-- Add helpful comments
COMMENT ON COLUMN campaigns.product_rules IS 'Array of product rule groups and operators';
COMMENT ON COLUMN campaigns.conditions IS 'Array of condition groups and operators';

-- Create a function to validate JSON structure
CREATE OR REPLACE FUNCTION validate_campaign_json()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate product_rules JSON
  IF NEW.product_rules IS NOT NULL THEN
    IF jsonb_typeof(NEW.product_rules) <> 'array' THEN
      RAISE EXCEPTION 'Invalid product_rules: must be an array';
    END IF;

    PERFORM *
    FROM jsonb_array_elements(NEW.product_rules) value
    WHERE NOT (
      (value->>'type' IN ('group', 'group_operator')) AND
      (
        (value->>'type' = 'group' AND
         value ? 'match' AND
         value ? 'conditions' AND
         jsonb_typeof(value->'conditions') = 'array'
        ) OR
        (value->>'type' = 'group_operator' AND
         value ? 'operator' AND
         value->>'operator' IN ('AND', 'OR')
        )
      )
    );

    IF FOUND THEN
      RAISE EXCEPTION 'Invalid product_rules: failed validation';
    END IF;
  END IF;

  -- Validate conditions JSON
  IF NEW.conditions IS NOT NULL THEN
    IF jsonb_typeof(NEW.conditions) <> 'array' THEN
      RAISE EXCEPTION 'Invalid conditions: must be an array';
    END IF;

    PERFORM *
    FROM jsonb_array_elements(NEW.conditions) value
    WHERE NOT (
      (value->>'type' IN ('group', 'group_operator')) AND
      (
        (value->>'type' = 'group' AND
         value ? 'match' AND
         value ? 'conditions' AND
         jsonb_typeof(value->'conditions') = 'array'
        ) OR
        (value->>'type' = 'group_operator' AND
         value ? 'operator' AND
         value->>'operator' IN ('AND', 'OR')
        )
      )
    );

    IF FOUND THEN
      RAISE EXCEPTION 'Invalid conditions: failed validation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the validation function to the campaigns table
DROP TRIGGER IF EXISTS validate_campaigns_json ON campaigns;

CREATE TRIGGER validate_campaigns_json
BEFORE INSERT OR UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION validate_campaign_json();