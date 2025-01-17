-- Add is_verified column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS customers_is_verified_idx ON customers(is_verified);

COMMENT ON COLUMN customers.is_verified IS 'Indicates if the customer has been verified';