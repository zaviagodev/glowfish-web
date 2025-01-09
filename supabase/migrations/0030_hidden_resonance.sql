/*
  # Add Payment and Shipping Details

  1. New Columns
    - `payment_details` - JSONB column for storing payment information
    - `shipping_details` - JSONB column for storing shipping information
  
  2. Constraints
    - Add validation for payment_details structure
    - Add validation for shipping_details structure
  
  3. Indexes
    - Add index for payment type queries
    - Add index for shipping status queries
*/

-- Add payment_details column with validation
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_details JSONB,
  ADD COLUMN IF NOT EXISTS shipping_details JSONB;

-- Drop the existing constraint if it exists
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS valid_payment_details;

-- Add check constraint for payment_details structure
ALTER TABLE orders
  ADD CONSTRAINT valid_payment_details CHECK (
    payment_details IS NULL OR (
      payment_details ? 'type' AND
      payment_details->>'type' IN ('bank_transfer', 'credit_card', 'promptpay') AND
      (
        (payment_details->>'type' = 'bank_transfer' AND payment_details ? 'bank_name') OR
        (payment_details->>'type' = 'credit_card' AND payment_details ? 'card_type') OR
        (payment_details->>'type' = 'promptpay' AND payment_details ? 'qr_code')
      )
    )
  );

-- Add check constraint for shipping_details structure
ALTER TABLE orders
  ADD CONSTRAINT valid_shipping_details CHECK (
    shipping_details IS NULL OR (
      shipping_details ? 'courier' AND
      shipping_details ? 'tracking_number' AND
      shipping_details ? 'shipped_at'
    )
  );

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS orders_payment_type_idx 
  ON orders ((payment_details->>'type')) 
  WHERE payment_details IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_shipping_status_idx 
  ON orders ((shipping_details->>'shipped_at')) 
  WHERE shipping_details IS NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN orders.payment_details IS 'Stores payment information including type, confirmation details, and provider-specific data';
COMMENT ON COLUMN orders.shipping_details IS 'Stores shipping information including courier, tracking number, and shipping date';