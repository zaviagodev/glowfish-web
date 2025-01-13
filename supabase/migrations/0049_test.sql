-- Add meta column to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS customers_meta_gin_idx ON customers USING GIN (meta);

-- Add helpful comments
COMMENT ON COLUMN customers.meta IS 'Stores additional customer metadata like interests and preferences';
COMMENT ON INDEX customers_meta_gin_idx IS 'GIN index for efficient JSON querying of customer metadata';