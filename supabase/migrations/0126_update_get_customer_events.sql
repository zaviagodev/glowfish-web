/*
# Update Customer Events Function

1. Changes
  - Restructure get_customer_events function to return order-based results
  - Add proper joins with products table for event names
  - Include complete product details in event information
  - Improve JSON structure for tickets and event details
  - Add proper TIMESTAMPTZ handling
*/

-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_customer_events(UUID, INT, INT);

CREATE OR REPLACE FUNCTION get_customer_events(
    p_customer_id UUID,
    p_limit INT DEFAULT 10,
    p_offset INT DEFAULT 0
) 
RETURNS TABLE (
    order_id UUID,
    customer_id UUID,
    created_at TIMESTAMPTZ,
    tickets JSONB,
    event JSONB,
    total_orders BIGINT
) 
LANGUAGE plpgsql 
AS $$
DECLARE
    total_orders BIGINT;
BEGIN
    -- Get the total count of unique orders for pagination
    SELECT COUNT(DISTINCT o.id)
    INTO total_orders
    FROM orders o
    JOIN rewards r ON o.id = r.order_id
    WHERE o.customer_id = p_customer_id
    AND r.metadata->>'eventId' IS NOT NULL;

    -- Return query that groups tickets by order_id
    RETURN QUERY
    WITH order_tickets AS (
        SELECT 
            o.id AS order_id,
            to_jsonb(array_agg(
                json_build_object(
                    'id', r.id,
                    'code', r.code,
                    'status', r.status,
                    'metadata', r.metadata,
                    'order_item_id', r.order_item_id
                )::jsonb
                ORDER BY r.created_at DESC
            )) AS tickets,
            (r.metadata->>'eventId')::UUID AS event_id
        FROM orders o
        JOIN rewards r ON o.id = r.order_id
        WHERE o.customer_id = p_customer_id
        AND r.metadata->>'eventId' IS NOT NULL
        GROUP BY o.id, (r.metadata->>'eventId')::UUID
    ),
    product_details AS (
        SELECT 
            p.id,
            jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'description', p.description,
                'price', p.price,
                'compare_at_price', p.compare_at_price,
                'status', p.status,
                'images', COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', pi.id,
                                'url', pi.url,
                                'alt', pi.alt,
                                'position', pi.position
                            )
                            ORDER BY pi.position
                        )
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                    ),
                    '[]'::jsonb
                ),
                'variants', COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', pv.id,
                                'name', pv.name,
                                'sku', pv.sku,
                                'price', pv.price,
                                'compare_at_price', pv.compare_at_price,
                                'quantity', pv.quantity,
                                'status', pv.status
                            )
                            ORDER BY pv.position
                        )
                        FROM product_variants pv
                        WHERE pv.product_id = p.id
                    ),
                    '[]'::jsonb
                )
            ) AS product
        FROM products p
    ),
    event_details AS (
        SELECT 
            e.id AS event_id,
            jsonb_build_object(
                'event_id', e.id,
                'name', p.name,
                'start_datetime', e.start_datetime::TIMESTAMPTZ,
                'end_datetime', e.end_datetime::TIMESTAMPTZ,
                'venue_name', e.venue_name,
                'venue_address', e.venue_address,
                'organizer_name', e.organizer_name,
                'organizer_contact', e.organizer_contact,
                'google_maps_link', e.google_maps_link,
                'attendance_points', e.attendance_points,
                'product', pd.product
            ) AS event
        FROM events e
        JOIN products p ON e.product_id = p.id
        JOIN product_details pd ON pd.id = p.id
    )
    SELECT 
        o.id AS order_id,
        o.customer_id,
        o.created_at::TIMESTAMPTZ,
        ot.tickets,
        ed.event,
        total_orders
    FROM orders o
    JOIN order_tickets ot ON o.id = ot.order_id
    LEFT JOIN event_details ed ON ot.event_id = ed.event_id
    ORDER BY o.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_customer_events TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_customer_events IS 'Returns customer event tickets grouped by order with event and product details'; 