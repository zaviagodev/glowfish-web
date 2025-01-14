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