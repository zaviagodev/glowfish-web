-- supabase/migrations/0052_customer_auth.sql
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

-- Add policies for customers to view their orders
CREATE POLICY "Customers can view their own orders"
  ON orders
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_id FROM customers
      WHERE customers.id = orders.customer_id
    )
  );

-- Add policies for customers to view their order items
CREATE POLICY "Customers can view their order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN customers ON customers.id = orders.customer_id
      WHERE orders.id = order_items.order_id
      AND customers.auth_id = auth.uid()
    )
  );

-- Add helpful comments
COMMENT ON POLICY "Customers can view their own orders" ON orders IS 'Allows customers to view their order history';
COMMENT ON POLICY "Customers can view their order items" ON order_items IS 'Allows customers to view items in their orders';