/*
  # Update customer groups conditions schema

  1. Changes
    - Add validation for condition values and operators
    - Add check constraints for numeric values
    - Add comments for better documentation
    - Replace invalid CHECK constraint with a BEFORE INSERT/UPDATE trigger

  2. Schema Updates
    - Add condition_operator ENUM type
    - Add validate_condition function
    - Add trigger for validating conditions
*/

-- Create enum for condition operators
CREATE TYPE condition_operator AS ENUM ('greater_than', 'less_than', 'equal_to');

-- Create function to validate condition structure
CREATE OR REPLACE FUNCTION validate_condition(condition jsonb) 
RETURNS boolean AS $$
BEGIN
  -- Check required fields
  IF NOT (
    condition ? 'type' AND
    condition ? 'value' AND
    condition ? 'operator' AND
    condition ? 'enabled'
  ) THEN
    RETURN false;
  END IF;

  -- Validate operator based on type
  CASE condition->>'type'
    WHEN 'total_spent' THEN
      -- Validate numeric value for total spent
      IF NOT (
        condition->>'operator' IN ('greater_than', 'less_than', 'equal_to') AND
        (condition->>'value')::numeric >= 0
      ) THEN
        RETURN false;
      END IF;
    WHEN 'order_count' THEN
      -- Validate integer value for order count
      IF NOT (
        condition->>'operator' IN ('greater_than', 'less_than', 'equal_to') AND
        (condition->>'value')::integer >= 0
      ) THEN
        RETURN false;
      END IF;
    WHEN 'last_order' THEN
      -- Validate integer value for days
      IF NOT (
        condition->>'operator' IN ('greater_than', 'less_than') AND
        (condition->>'value')::integer >= 0
      ) THEN
        RETURN false;
      END IF;
    WHEN 'location' THEN
      -- Validate location has a non-empty string value
      IF NOT (
        condition->>'operator' = 'equal_to' AND
        length(condition->>'value') > 0
      ) THEN
        RETURN false;
      END IF;
    ELSE
      RETURN false;
  END CASE;

  RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to validate conditions
CREATE OR REPLACE FUNCTION validate_conditions_array()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conditions IS NOT NULL AND NEW.conditions <> '[]'::jsonb THEN
    -- Ensure conditions is an array
    IF jsonb_typeof(NEW.conditions) <> 'array' THEN
      RAISE EXCEPTION 'Conditions must be a JSON array';
    END IF;

    -- Validate each condition in the array
    IF NOT (
      SELECT bool_and(validate_condition(elem))
      FROM jsonb_array_elements(NEW.conditions) elem
    ) THEN
      RAISE EXCEPTION 'Invalid condition structure detected in conditions array';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for customer_groups
CREATE TRIGGER validate_conditions_trigger
BEFORE INSERT OR UPDATE ON customer_groups
FOR EACH ROW
EXECUTE FUNCTION validate_conditions_array();

-- Add helpful comments
COMMENT ON TABLE customer_groups IS 'Stores customer group definitions with automated assignment rules';
COMMENT ON COLUMN customer_groups.conditions IS 'Array of conditions for automatic group assignment. Each condition must include type, value, operator, and enabled status.';
