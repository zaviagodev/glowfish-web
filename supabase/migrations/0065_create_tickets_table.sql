-- Create set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    order_item_id uuid REFERENCES public.order_items(id) ON DELETE CASCADE,
    code text NOT NULL UNIQUE,
    status text NOT NULL CHECK (status IN ('unused', 'used')),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Store staff can view tickets for their store
CREATE POLICY "Store staff can view tickets for their store"
    ON public.tickets FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN profiles p ON p.store_name = o.store_name
            WHERE o.id = tickets.order_id
            AND p.id = auth.uid()
        )
    );

-- Customers can view their own tickets
CREATE POLICY "Customers can view their own tickets"
    ON public.tickets FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN customers c ON c.id = o.customer_id
            WHERE o.id = tickets.order_id
            AND c.auth_id = auth.uid()
        )
    );

-- Only store staff can insert tickets
CREATE POLICY "Store staff can insert tickets"
    ON public.tickets FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN profiles p ON p.store_name = o.store_name
            WHERE o.id = order_id
            AND p.id = auth.uid()
        )
    );

-- Only store staff can update tickets
CREATE POLICY "Store staff can update tickets"
    ON public.tickets FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN profiles p ON p.store_name = o.store_name
            WHERE o.id = tickets.order_id
            AND p.id = auth.uid()
        )
    );

-- Create index for faster lookups
CREATE INDEX tickets_order_id_idx ON public.tickets(order_id);
CREATE INDEX tickets_order_item_id_idx ON public.tickets(order_item_id);
CREATE INDEX tickets_status_idx ON public.tickets(status);
CREATE INDEX tickets_code_idx ON public.tickets(code);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER set_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Function to generate a unique 10-character ticket code
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result text := '';
    i integer;
    random_num integer;
BEGIN
    -- Generate a 10-character random code
    FOR i IN 1..10 LOOP
        random_num := floor(random() * length(chars) + 1);
        result := result || substr(chars, random_num, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Function to create tickets when order status changes to processing
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

-- Add trigger for order status changes
DROP TRIGGER IF EXISTS handle_order_status_change_trigger ON orders;
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER handle_order_status_change_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_status_change();