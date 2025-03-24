-- Drop existing views if they exist
DROP VIEW IF EXISTS event_orders;
DROP VIEW IF EXISTS reward_orders;
DROP VIEW IF EXISTS product_orders;

-- Create event_orders view
CREATE VIEW event_orders WITH (security_invoker = true) AS
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
      'meta_data', oi.meta_data,
      'product_variant', jsonb_build_object(
        'name', oi.variant_snapshot->>'name',
        'options', oi.variant_snapshot->'options',
        'product', jsonb_build_object(
          'name', oi.product_snapshot->>'name',
          'status', p.status,
          'images', oi.product_snapshot->'images'
        )
      )
    )
  ) as order_items
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE (oi.meta_data->>'event')::boolean = true
GROUP BY 
  o.id, 
  o.store_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone;

-- Create reward_orders view
CREATE VIEW reward_orders WITH (security_invoker = true) AS
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
      'meta_data', oi.meta_data,
      'product_variant', jsonb_build_object(
        'name', oi.variant_snapshot->>'name',
        'options', oi.variant_snapshot->'options',
        'product', jsonb_build_object(
          'name', oi.product_snapshot->>'name',
          'status', p.status,
          'images', oi.product_snapshot->'images'
        )
      )
    )
  ) as order_items
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE (oi.meta_data->>'reward')::boolean = true AND (oi.meta_data->>'event')::boolean = false
GROUP BY 
  o.id, 
  o.store_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone;

-- Create product_orders view
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
      'meta_data', oi.meta_data,
      'product_variant', jsonb_build_object(
        'name', oi.variant_snapshot->>'name',
        'options', oi.variant_snapshot->'options',
        'product', jsonb_build_object(
          'name', oi.product_snapshot->>'name',
          'status', p.status,
          'images', oi.product_snapshot->'images'
        )
      )
    )
  ) as order_items
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN regular_products rp ON p.id = rp.product_id
WHERE (oi.meta_data->>'reward')::boolean = false AND (oi.meta_data->>'event')::boolean = false
GROUP BY 
  o.id, 
  o.store_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone;

-- Add helpful comments
COMMENT ON VIEW event_orders IS 'A view that combines orders and event product information for easy querying of event orders';
COMMENT ON VIEW reward_orders IS 'A view that combines orders and reward product information for easy querying of reward orders'; 
COMMENT ON VIEW product_orders IS 'A view that combines orders and regular product information for easy querying of regular product orders'; 