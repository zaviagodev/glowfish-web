-- Update handle_order_status_change function to handle loyalty points redemption
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item record;
    ticket_code text;
    i integer;
    existing_ticket_count integer;
BEGIN
    -- Only proceed if status is changing to 'processing'
    IF NEW.status = 'processing' AND (OLD.status IS NULL OR OLD.status != 'processing') THEN
        -- Handle loyalty points redemption if points were used
        IF NEW.loyalty_points_used > 0 THEN
            -- Insert points transaction for redemption
            INSERT INTO points_transactions (
                store_name,
                customer_id,
                order_id,
                points,
                type,
                description
            ) VALUES (
                NEW.store_name,
                NEW.customer_id,
                NEW.id,
                NEW.loyalty_points_used,
                'redeem',
                'Points redeemed for order #' || NEW.id
            );
        END IF;

        -- Loop through order items that are event products
        FOR item IN (
            SELECT 
                oi.id AS order_item_id,
                oi.quantity,
                p.id AS product_id,
                p.name AS product_name,
                e.id AS event_id,
                c.email AS customer_email,
                c.first_name || ' ' || c.last_name AS customer_name
            FROM order_items oi
            JOIN product_variants pv ON pv.id = oi.variant_id
            JOIN products p ON p.id = pv.product_id
            JOIN events e ON e.product_id = p.id
            LEFT JOIN customers c ON c.id = NEW.customer_id
            WHERE oi.order_id = NEW.id
        )
        LOOP
            -- Count existing tickets for this order item
            SELECT COUNT(*) INTO existing_ticket_count 
            FROM tickets 
            WHERE order_item_id = item.order_item_id;

            -- If we need more tickets
            IF item.quantity > existing_ticket_count THEN
                -- Generate additional tickets
                FOR i IN 1..(item.quantity - existing_ticket_count) LOOP
                    -- Generate unique ticket code (retry if duplicate)
                    LOOP
                        ticket_code := generate_ticket_code();
                        EXIT WHEN NOT EXISTS (SELECT 1 FROM tickets WHERE code = ticket_code);
                    END LOOP;
                    
                    -- Insert ticket
                    INSERT INTO tickets (
                        order_id,
                        order_item_id,
                        code,
                        status,
                        metadata
                    ) VALUES (
                        NEW.id,
                        item.order_item_id,
                        ticket_code,
                        'unused',
                        jsonb_build_object(
                            'eventId', item.event_id,
                            'eventName', item.product_name,
                            'attendeeName', item.customer_name,
                            'attendeeEmail', item.customer_email,
                            'ticketNumber', ticket_code,
                            'purchaseDate', NEW.created_at
                        )
                    );
                END LOOP;
            -- If we need fewer tickets
            ELSIF item.quantity < existing_ticket_count THEN
                -- Delete excess unused tickets
                WITH tickets_to_delete AS (
                    SELECT id 
                    FROM tickets 
                    WHERE order_item_id = item.order_item_id 
                    AND status = 'unused'
                    ORDER BY created_at DESC
                    LIMIT (existing_ticket_count - item.quantity)
                )
                DELETE FROM tickets 
                WHERE id IN (SELECT id FROM tickets_to_delete);
            END IF;
        END LOOP;

        -- Only send notification if we actually created new tickets
        IF EXISTS (
            SELECT 1 FROM tickets 
            WHERE order_id = NEW.id 
            AND created_at >= NEW.updated_at - interval '1 second'
        ) THEN
            PERFORM pg_notify(
                'ticket_created',
                json_build_object(
                    'order_id', NEW.id,
                    'customer_email', (
                        SELECT email FROM customers WHERE id = NEW.customer_id
                    )
                )::text
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$; 