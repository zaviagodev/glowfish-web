-- Drop create_default_variant trigger and function
DROP TRIGGER IF EXISTS create_default_variant_trigger ON products;

DROP FUNCTION IF EXISTS create_default_variant();

-- Remove points_based_price from products table
ALTER TABLE products
DROP COLUMN IF EXISTS points_based_price;

-- Add avatar_url to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create function to handle zero total orders
CREATE OR REPLACE FUNCTION handle_zero_total_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If total is 0, automatically set status to processing
    IF NEW.total = 0 AND (NEW.status IS NULL OR NEW.status = 'pending') THEN
        NEW.status := 'processing';
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate triggers in desired order
DROP TRIGGER IF EXISTS validate_applied_coupons_trigger ON orders;
DROP TRIGGER IF EXISTS revalidate_applied_coupons_trigger ON orders;
DROP TRIGGER IF EXISTS handle_zero_total_orders_trigger ON orders;
DROP TRIGGER IF EXISTS handle_order_status_change_trigger ON orders;

CREATE TRIGGER validate_applied_coupons_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_applied_coupons();

CREATE TRIGGER revalidate_applied_coupons_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION revalidate_applied_coupons();

-- Add trigger for zero total orders
DROP TRIGGER IF EXISTS handle_zero_total_orders_trigger ON orders;
CREATE TRIGGER handle_zero_total_orders_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_zero_total_orders();

-- Add trigger for order status changes
DROP TRIGGER IF EXISTS handle_order_status_change_trigger ON orders;
CREATE TRIGGER handle_order_status_change_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_status_change();