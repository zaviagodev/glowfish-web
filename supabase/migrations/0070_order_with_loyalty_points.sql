-- Add loyalty points rate to orders table
ALTER TABLE orders
ADD COLUMN loyalty_points_rate INTEGER DEFAULT 100;

-- Add loyalty points rate to ecommerce settings
ALTER TABLE store_settings
ADD COLUMN loyalty_points_rate INTEGER DEFAULT 100;

-- Add loyalty points columns to orders
ALTER TABLE orders
ADD COLUMN loyalty_points_used INTEGER DEFAULT 0;

-- Add helpful comments
COMMENT ON COLUMN store_settings.loyalty_points_rate IS 'Number of loyalty points equal to 1 unit of currency (default: 100 points = $1)';

COMMENT ON FUNCTION update_customer_loyalty_points IS 'Updates customer loyalty points when points_transactions change';

-- Add points_based_price to order_items
ALTER TABLE order_items ADD COLUMN points_based_price INTEGER DEFAULT 0;