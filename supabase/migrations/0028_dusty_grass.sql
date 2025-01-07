-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their store's customers" ON customers;

-- Create new policy for customer updates
CREATE POLICY "Users can update their store's customers"
ON customers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.store_name = customers.store_name
    AND profiles.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.store_name = customers.store_name
    AND profiles.id = auth.uid()
  )
);

-- Add helpful comment
COMMENT ON POLICY "Users can update their store's customers" ON customers IS 
  'Allows users to update customers that belong to their store';