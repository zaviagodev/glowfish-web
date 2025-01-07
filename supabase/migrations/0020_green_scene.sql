/*
  # Update customer groups conditions schema

  1. Changes
    - Add validation for condition values and operators
    - Add check constraints for numeric values
    - Add comments for better documentation

  2. Schema Updates
    - Add check constraint for condition operators
    - Add check constraint for numeric values
    - Add validation function for condition structure
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

-- Add check constraint to validate conditions array
ALTER TABLE customer_groups
  ADD CONSTRAINT valid_conditions CHECK (
    conditions IS NULL OR
    conditions = '[]'::jsonb OR
    (
      jsonb_typeof(conditions) = 'array' AND
      jsonb_array_length(conditions) > 0 AND
      (
        SELECT bool_and(validate_condition(elem))
        FROM jsonb_array_elements(conditions) elem
      )
    )
  );

-- Add helpful comments
COMMENT ON TABLE customer_groups IS 'Stores customer group definitions with automated assignment rules';
COMMENT ON COLUMN customer_groups.conditions IS 'Array of conditions for automatic group assignment. Each condition must include type, value, operator, and enabled status.';