DROP POLICY IF EXISTS "Enable read access for customers" ON points_transactions;
CREATE POLICY "Enable read access for customers" ON points_transactions
FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth_id FROM customers 
    WHERE customers.id = points_transactions.customer_id
  )
);