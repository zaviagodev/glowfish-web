-- Add auth fields to customers table
ALTER TABLE customers
  ADD COLUMN auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN password_hash text;

-- Add unique constraint for auth_id
ALTER TABLE customers
  ADD CONSTRAINT customers_auth_id_key UNIQUE (auth_id);

-- Update RLS policies for customer auth
CREATE POLICY "Customers can view their own data"
  ON customers
  FOR SELECT 
  USING (
    auth.uid() = auth_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = customers.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Customers can update their own data"
  ON customers
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Add policies for customer addresses
CREATE POLICY "Customers can view their own addresses"
  ON customer_addresses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_addresses.customer_id
      AND customers.auth_id = auth.uid()
    )
  );

CREATE POLICY "Customers can manage their own addresses"
  ON customer_addresses
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_addresses.customer_id
      AND customers.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_addresses.customer_id
      AND customers.auth_id = auth.uid()
    )
  );