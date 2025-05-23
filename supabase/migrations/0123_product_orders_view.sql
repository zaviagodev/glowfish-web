-- Create product_orders view
DROP VIEW IF EXISTS product_orders;
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

-- Add helpful comments
COMMENT ON VIEW product_orders IS 'A view that combines orders and regular product information for easy querying of regular product orders'; 