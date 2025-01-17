/*
  # Add payment details to orders

  1. Changes
    - Add payment_details JSONB column to orders table
    - Add validation check for payment_details structure
    - Add index for payment type queries
*/

-- Add payment_details column
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_details JSONB;

-- Add check constraint to validate payment_details structure
ALTER TABLE orders
  ADD CONSTRAINT valid_payment_details CHECK (
    payment_details IS NULL OR (
      payment_details ? 'type' AND
      payment_details->>'type' IN ('bank_transfer', 'credit_card', 'promptpay') AND
      payment_details ? 'confirmed_at'
    )
  );

-- Add index for payment type queries
CREATE INDEX IF NOT EXISTS orders_payment_type_idx ON orders ((payment_details->>'type')) WHERE payment_details IS NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN orders.payment_details IS 'Stores payment information including type, confirmation details, and any provider-specific data';