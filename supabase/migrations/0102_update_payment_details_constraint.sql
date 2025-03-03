-- Update payment_details constraint to match frontend implementation
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_payment_details;

ALTER TABLE orders ADD CONSTRAINT valid_payment_details CHECK (
  payment_details IS NULL OR (
    payment_details ? 'type' AND
    payment_details->>'type' IN ('bank_transfer', 'promptpay') AND
    (
      -- Bank transfer validation
      (
        payment_details->>'type' = 'bank_transfer' AND
        payment_details ? 'bank_name' AND
        payment_details ? 'account_name' AND
        payment_details ? 'account_number' AND
        payment_details ? 'branch'
      ) OR
      -- Promptpay validation
      (
        payment_details->>'type' = 'promptpay' AND
        payment_details ? 'promptpay_name' AND
        payment_details ? 'promptpay_id' AND
        payment_details ? 'promptpay_qr_code'
      )
    )
  )
);

COMMENT ON CONSTRAINT valid_payment_details ON orders IS 'Ensures payment details match the required structure for bank transfers and promptpay payments'; 