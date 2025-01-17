-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their store's points transactions" ON points_transactions;

-- Create comprehensive RLS policies
CREATE POLICY "Enable full access for store owners"
ON points_transactions
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.store_name = points_transactions.store_name
    AND profiles.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.store_name = points_transactions.store_name
    AND profiles.id = auth.uid()
  )
);

CREATE POLICY "Enable read access for customers"
ON points_transactions
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM customers 
    WHERE customers.id = points_transactions.customer_id
  )
);

-- Add helpful comment
COMMENT ON TABLE points_transactions IS 'Records points transactions with proper access control for store owners and customers';