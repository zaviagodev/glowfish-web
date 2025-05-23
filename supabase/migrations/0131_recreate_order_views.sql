/*
# Recreate Order Views

1. Changes
  - Drop existing views
  - Recreate product_orders view for regular product orders
  - Recreate event_orders view for event ticket orders
  - Recreate reward_orders view for reward product orders
  - Add proper indexes for performance
*/

-- Drop existing views
DROP VIEW IF EXISTS product_orders;
DROP VIEW IF EXISTS event_orders;
DROP VIEW IF EXISTS reward_orders;

-- Create indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_products_is_reward ON products(is_reward);
CREATE INDEX IF NOT EXISTS idx_events_product_id ON events(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_name ON orders(store_name);

CREATE VIEW product_orders WITH (security_invoker = true) AS
WITH regular_products AS (
  SELECT DISTINCT p.id as product_id 
  FROM products p
  WHERE p.is_reward = false
  AND NOT EXISTS (
    SELECT 1 FROM events e 
    WHERE e.product_id = p.id
  )
)
SELECT 
  o.*,
  c.first_name as customer_first_name,
  c.last_name as customer_last_name,
  c.email as customer_email,
  c.phone as customer_phone,
  jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'variant_id', oi.variant_id,
      'quantity', oi.quantity,
      'price', oi.price,
      'total', oi.total,
      'product_variant', jsonb_build_object(
        'name', pv.name,
        'options', pv.options,
        'product', jsonb_build_object(
          'name', p.name,
          'status', p.status,
          'images', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', pi.id,
                'url', pi.url,
                'alt', pi.alt,
                'position', pi.position
              )
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          )
        )
      )
    )
  ) as order_items
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN product_variants pv ON oi.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
JOIN regular_products rp ON p.id = rp.product_id
GROUP BY 
  o.id, 
  o.store_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone;

-- Create event_orders view for event ticket orders
CREATE VIEW event_orders WITH (security_invoker = true) AS
WITH event_products AS (
  SELECT DISTINCT product_id 
  FROM events
)
SELECT 
  o.*,
  c.first_name as customer_first_name,
  c.last_name as customer_last_name,
  c.email as customer_email,
  c.phone as customer_phone,
  jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'variant_id', oi.variant_id,
      'quantity', oi.quantity,
      'price', oi.price,
      'total', oi.total,
      'product_variant', jsonb_build_object(
        'name', pv.name,
        'options', pv.options,
        'product', jsonb_build_object(
          'name', p.name,
          'status', p.status,
          'images', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', pi.id,
                'url', pi.url,
                'alt', pi.alt,
                'position', pi.position
              )
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          'event', (
            SELECT jsonb_build_object(
              'id', e.id,
              'start_datetime', e.start_datetime,
              'end_datetime', e.end_datetime,
              'venue_name', e.venue_name,
              'venue_address', e.venue_address,
              'attendance_points', e.attendance_points
            )
            FROM events e
            WHERE e.product_id = p.id
            LIMIT 1
          )
        )
      )
    )
  ) as order_items
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN product_variants pv ON oi.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
JOIN event_products ep ON p.id = ep.product_id
GROUP BY 
  o.id, 
  o.store_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone;


-- Create reward_orders view for reward product orders
CREATE VIEW reward_orders WITH (security_invoker = true) AS
WITH reward_products AS (
  SELECT DISTINCT p.id as product_id 
  FROM products p
  WHERE p.is_reward = true
  AND NOT EXISTS (
    SELECT 1 FROM events e 
    WHERE e.product_id = p.id
  )
)
SELECT 
  o.*,
  c.first_name as customer_first_name,
  c.last_name as customer_last_name,
  c.email as customer_email,
  c.phone as customer_phone,
  jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'variant_id', oi.variant_id,
      'quantity', oi.quantity,
      'price', oi.price,
      'total', oi.total,
      'points_based_price', pv.points_based_price,
      'product_variant', jsonb_build_object(
        'name', pv.name,
        'options', pv.options,
        'product', jsonb_build_object(
          'name', p.name,
          'status', p.status,
          'images', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', pi.id,
                'url', pi.url,
                'alt', pi.alt,
                'position', pi.position
              )
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          )
        )
      )
    )
  ) as order_items
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN product_variants pv ON oi.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
JOIN reward_products rp ON p.id = rp.product_id
GROUP BY 
  o.id, 
  o.store_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone;

-- Add helpful comments
COMMENT ON VIEW product_orders IS 'A view that combines orders and regular product information for easy querying of regular product orders'; 
COMMENT ON VIEW event_orders IS 'A view that combines orders, tickets, and event information for easy querying of event orders'; 
COMMENT ON VIEW reward_orders IS 'A view that combines orders, rewards, and product information for easy querying of reward orders';