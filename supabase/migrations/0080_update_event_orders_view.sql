/*
# Update Event Orders View

1. Changes
  - Update event_orders view to include attendance_points field
*/

-- Drop the existing view
DROP VIEW IF EXISTS event_orders;

-- Recreate the view with attendance_points
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

-- Add helpful comments
COMMENT ON VIEW event_orders IS 'A view that combines orders, tickets, and event information for easy querying of event orders'; 