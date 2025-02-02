-- Create indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_events_product_id ON events(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_name ON orders(store_name);


-- Create a materialized view for event orders
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
              'venue_address', e.venue_address
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

-- -- Create index on the materialized view
-- CREATE INDEX idx_event_orders_store_name ON event_orders(store_name);

-- -- Create a function to refresh the materialized view
-- CREATE OR REPLACE FUNCTION refresh_event_orders()
-- RETURNS trigger AS $$
-- BEGIN
--   REFRESH MATERIALIZED VIEW CONCURRENTLY event_orders;
--   RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Create triggers to refresh the materialized view
-- CREATE TRIGGER refresh_event_orders_on_order
--   AFTER INSERT OR UPDATE OR DELETE ON orders
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION refresh_event_orders();

-- CREATE TRIGGER refresh_event_orders_on_order_items
--   AFTER INSERT OR UPDATE OR DELETE ON order_items
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION refresh_event_orders();

-- CREATE TRIGGER refresh_event_orders_on_events
--   AFTER INSERT OR UPDATE OR DELETE ON events
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION refresh_event_orders(); 