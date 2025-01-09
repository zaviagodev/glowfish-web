/*
  # Update customer groups conditions schema

  1. Changes
    - Add validation for condition values and operators
    - Add check constraints for condition structure
    - Add helpful comments for documentation

  2. Schema Updates
    - Add check constraint for condition types
    - Add check constraint for operators
    - Add validation for condition values
*/

-- Create type for condition operators
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'condition_operator') THEN
    CREATE TYPE condition_operator AS ENUM ('greater_than', 'less_than', 'equal_to');
  END IF;
END;
$$;

-- Create type for condition types
CREATE TYPE condition_type AS ENUM ('total_spent', 'order_count', 'last_order', 'location');

-- Add check constraint for conditions array structure
ALTER TABLE customer_groups
  ADD CONSTRAINT valid_conditions CHECK (
    conditions IS NULL OR
    conditions = '[]'::jsonb OR
    (
      jsonb_typeof(conditions) = 'array' AND
      jsonb_array_length(conditions) > 0
    )
  );

-- Add trigger function to validate conditions
CREATE OR REPLACE FUNCTION validate_conditions()
RETURNS TRIGGER AS $$
DECLARE
  condition_record jsonb;
BEGIN
  -- Skip validation if conditions is null or empty
  IF NEW.conditions IS NULL OR NEW.conditions = '[]'::jsonb THEN
    RETURN NEW;
  END IF;

  -- Validate each condition
  FOR condition_record IN SELECT * FROM jsonb_array_elements(NEW.conditions)
  LOOP
    -- Check required fields exist
    IF NOT (
      condition_record ? 'type' AND
      condition_record ? 'value' AND
      condition_record ? 'operator' AND
      condition_record ? 'enabled'
    ) THEN
      RAISE EXCEPTION 'Invalid condition structure: missing required fields';
    END IF;

    -- Validate type
    IF NOT condition_record->>'type' = ANY (enum_range(NULL::condition_type)::text[]) THEN
      RAISE EXCEPTION 'Invalid condition type: %', condition_record->>'type';
    END IF;

    -- Validate operator
    IF NOT condition_record->>'operator' = ANY (enum_range(NULL::condition_operator)::text[]) THEN
      RAISE EXCEPTION 'Invalid condition operator: %', condition_record->>'operator';
    END IF;

    -- Type-specific validations
    CASE condition_record->>'type'
      WHEN 'total_spent' THEN
        IF NOT (condition_record->>'value')::numeric >= 0 THEN
          RAISE EXCEPTION 'Total spent value must be non-negative';
        END IF;
      WHEN 'order_count' THEN
        IF NOT (condition_record->>'value')::integer >= 0 THEN
          RAISE EXCEPTION 'Order count must be non-negative';
        END IF;
      WHEN 'last_order' THEN
        IF NOT (condition_record->>'value')::integer >= 0 THEN
          RAISE EXCEPTION 'Last order days must be non-negative';
        END IF;
        IF NOT condition_record->>'operator' IN ('greater_than', 'less_than') THEN
          RAISE EXCEPTION 'Last order only supports greater_than and less_than operators';
        END IF;
      WHEN 'location' THEN
        IF length(condition_record->>'value') = 0 THEN
          RAISE EXCEPTION 'Location value cannot be empty';
        END IF;
        IF condition_record->>'operator' != 'equal_to' THEN
          RAISE EXCEPTION 'Location only supports equal_to operator';
        END IF;
    END CASE;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing trigger if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'validate_conditions_trigger'
      AND tgrelid = 'customer_groups'::regclass
  ) THEN
    DROP TRIGGER validate_conditions_trigger ON customer_groups;
  END IF;
END;
$$;

-- Create trigger for conditions validation
CREATE TRIGGER validate_conditions_trigger
  BEFORE INSERT OR UPDATE ON customer_groups
  FOR EACH ROW
  EXECUTE FUNCTION validate_conditions();

-- Add helpful comments
COMMENT ON TABLE customer_groups IS 'Stores customer group definitions with automated assignment rules';
COMMENT ON COLUMN customer_groups.conditions IS 'Array of conditions for automatic group assignment. Each condition must include type, value, operator, and enabled status.';
COMMENT ON TYPE condition_operator IS 'Valid operators for customer group conditions';
COMMENT ON TYPE condition_type IS 'Valid types for customer group conditions';