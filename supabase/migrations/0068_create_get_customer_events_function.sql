-- Up Migration
CREATE OR REPLACE FUNCTION get_customer_events(p_customer_id UUID, p_limit INT, p_offset INT)
RETURNS TABLE (
    event_id UUID,
    event_name TEXT,
    google_maps_link TEXT,
    organizer_contact TEXT,
    organizer_name TEXT,
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    updated_at TIMESTAMP,
    venue_address TEXT,
    venue_name TEXT,
    image_url TEXT,
    ticket_details JSON[],
    total_count BIGINT
) AS $$

DECLARE
    total_events BIGINT;
BEGIN
    -- First get the total count of unique events
    SELECT COUNT(DISTINCT (t.metadata->>'eventId')::UUID)
    INTO total_events
    FROM tickets t
    JOIN orders o ON t.order_id = o.id
    WHERE o.customer_id = p_customer_id
    AND t.metadata->>'eventId' IS NOT NULL;

    RETURN QUERY
    WITH unique_events AS (
        SELECT DISTINCT ON ((t.metadata->>'eventId')::UUID)
            (t.metadata->>'eventId')::UUID as event_id
        FROM tickets t
        JOIN orders o ON t.order_id = o.id
        WHERE o.customer_id = p_customer_id
        AND t.metadata->>'eventId' IS NOT NULL
        ORDER BY (t.metadata->>'eventId')::UUID, t.created_at DESC
    ),
    event_tickets AS (
        SELECT 
            ue.event_id as eid,
            array_agg(
                json_build_object(
                    'id', t.id,
                    'code', t.code,
                    'status', t.status,
                    'metadata', t.metadata,
                    'order_item_id', t.order_item_id
                )::json
                ORDER BY t.created_at DESC
            ) as tickets
        FROM unique_events ue
        JOIN tickets t ON (t.metadata->>'eventId')::UUID = ue.event_id
        JOIN orders o ON t.order_id = o.id
        WHERE o.customer_id = p_customer_id
        GROUP BY ue.event_id
    ),
    event_images AS (
        SELECT DISTINCT ON (p.id)
            p.id as product_id,
            pi.url as image_url
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        ORDER BY p.id, pi.position ASC NULLS LAST
    )
    SELECT DISTINCT ON (e.id)
        e.id,
        p.name,
        e.google_maps_link,
        e.organizer_contact,
        e.organizer_name,
        e.start_datetime::TIMESTAMP,
        e.end_datetime::TIMESTAMP,
        e.updated_at::TIMESTAMP,
        e.venue_address,
        e.venue_name,
        ei.image_url,
        et.tickets,
        total_events
    FROM event_tickets et
    JOIN events e ON e.id = et.eid
    LEFT JOIN products p ON e.product_id = p.id
    LEFT JOIN event_images ei ON p.id = ei.product_id
    ORDER BY e.id, e.start_datetime DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;