/*
# Create Rewards Table

1. Changes
  - Create rewards table similar to tickets
  - Add RLS policies for store staff and customers
  - Add triggers and functions for reward code generation and points
  - Add indexes for performance
*/

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
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
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Store staff can view rewards for their store
DROP POLICY IF EXISTS "Store staff can view rewards for their store" ON rewards;
CREATE POLICY "Store staff can view rewards for their store"
    ON public.rewards FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN profiles p ON p.default_store_name = o.store_name
            WHERE o.id = rewards.order_id
            AND p.id = auth.uid()
        )
    );

-- Customers can view their own rewards
DROP POLICY IF EXISTS "Customers can view their own rewards" ON rewards;
CREATE POLICY "Customers can view their own rewards"
    ON public.rewards FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN customers c ON c.id = o.customer_id
            WHERE o.id = rewards.order_id
            AND c.auth_id = auth.uid()
        )
    );

-- Only store staff can insert rewards
DROP POLICY IF EXISTS "Store staff can insert rewards" ON rewards;
CREATE POLICY "Store staff can insert rewards"
    ON public.rewards FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN profiles p ON p.default_store_name = o.store_name
            WHERE o.id = order_id
            AND p.id = auth.uid()
        )
    );

-- Only store staff can update rewards
DROP POLICY IF EXISTS "Store staff can update rewards" ON rewards;
CREATE POLICY "Store staff can update rewards"
    ON public.rewards FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN profiles p ON p.default_store_name = o.store_name
            WHERE o.id = rewards.order_id
            AND p.id = auth.uid()
        )
    );

-- Create index for faster lookups
DROP INDEX IF EXISTS rewards_order_id_idx;
DROP INDEX IF EXISTS rewards_order_item_id_idx;
DROP INDEX IF EXISTS rewards_status_idx;
DROP INDEX IF EXISTS rewards_code_idx;
CREATE INDEX rewards_order_id_idx ON public.rewards(order_id);
CREATE INDEX rewards_order_item_id_idx ON public.rewards(order_item_id);
CREATE INDEX rewards_status_idx ON public.rewards(status);
CREATE INDEX rewards_code_idx ON public.rewards(code);

-- Add trigger for updating updated_at timestamp
DROP TRIGGER IF EXISTS set_rewards_updated_at ON rewards;
CREATE TRIGGER set_rewards_updated_at
    BEFORE UPDATE ON public.rewards
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Update handle_order_status_change function to handle loyalty points redemption
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item record;
    reward_code text;
    i integer;
    existing_reward_count integer;
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
            LEFT JOIN events e ON e.product_id = p.id
            LEFT JOIN customers c ON c.id = NEW.customer_id
            WHERE oi.order_id = NEW.id AND p.is_reward = true
        )
        LOOP
            -- Count existing rewards for this order item
            SELECT COUNT(*) INTO existing_reward_count 
            FROM rewards 
            WHERE order_item_id = item.order_item_id;

            -- If we need more rewards
            IF item.quantity > existing_reward_count THEN
                -- Generate additional rewards
                FOR i IN 1..(item.quantity - existing_reward_count) LOOP
                    -- Generate unique reward code (retry if duplicate)
                    LOOP
                        reward_code := generate_ticket_code();
                        EXIT WHEN NOT EXISTS (SELECT 1 FROM rewards WHERE code = reward_code);
                    END LOOP;
                    
                    -- Insert reward
                    INSERT INTO rewards (
                        order_id,
                        order_item_id,
                        code,
                        status,
                        metadata
                    ) VALUES (
                        NEW.id,
                        item.order_item_id,
                        reward_code,
                        'unused',
                        jsonb_build_object(
                            'eventId', item.event_id,
                            'eventName', item.product_name,
                            'productId', item.product_id,
                            'productName', item.product_name,
                            'customerName', item.customer_name,
                            'customerEmail', item.customer_email,
                            'rewardNumber', reward_code,
                            'purchaseDate', NEW.created_at
                        )
                    );
                END LOOP;
            -- If we need fewer rewards
            ELSIF item.quantity < existing_reward_count THEN
                -- Delete excess unused rewards
                WITH rewards_to_delete AS (
                    SELECT id 
                    FROM rewards 
                    WHERE order_item_id = item.order_item_id 
                    AND status = 'unused'
                    ORDER BY created_at DESC
                    LIMIT (existing_reward_count - item.quantity)
                )
                DELETE FROM rewards 
                WHERE id IN (SELECT id FROM rewards_to_delete);
            END IF;
        END LOOP;

        -- Only send notification if we actually created new rewards
        IF EXISTS (
            SELECT 1 FROM rewards 
            WHERE order_id = NEW.id 
            AND created_at >= NEW.updated_at - interval '1 second'
        ) THEN
            PERFORM pg_notify(
                'reward_created',
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

-- Create trigger
DROP TRIGGER IF EXISTS reward_attendance_points_trigger ON rewards;
CREATE TRIGGER reward_attendance_points_trigger
  AFTER UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION award_ticket_attendance_points();

-- Add helpful comments
COMMENT ON TABLE public.rewards IS 'Stores reward codes and their status';

-- DROP ticket table
DROP TRIGGER IF EXISTS set_tickets_updated_at ON tickets;
DROP TRIGGER IF EXISTS ticket_attendance_points_trigger ON tickets;
DROP TABLE IF EXISTS tickets;
