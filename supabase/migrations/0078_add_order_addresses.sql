/*
# Add shipping and billing address references to orders table

1. Changes
- Add shipping_address_id and billing_address_id columns to orders table
- Add foreign key constraints to customer_addresses table
- Update create_order and place_order functions to accept address IDs
- Add indexes for efficient querying
*/

-- Add address columns
ALTER TABLE orders
ADD COLUMN shipping_address_id uuid REFERENCES customer_addresses(id),
ADD COLUMN billing_address_id uuid REFERENCES customer_addresses(id);

-- Add indexes for efficient querying
CREATE INDEX orders_shipping_address_id_idx ON orders (shipping_address_id);
CREATE INDEX orders_billing_address_id_idx ON orders (billing_address_id);

-- Update create_order function
CREATE OR REPLACE FUNCTION create_order(
  p_store_name text,
  p_customer_id uuid,
  p_status text,
  p_subtotal numeric,
  p_discount numeric,
  p_points_discount numeric,
  p_shipping numeric,
  p_tax numeric,
  p_total numeric,
  p_notes text,
  p_tags text[],
  p_applied_coupons jsonb,
  p_loyalty_points_used numeric,
  p_shipping_address_id uuid,
  p_billing_address_id uuid,
  p_items jsonb
) RETURNS TABLE(order_id uuid, order_created_at timestamptz, order_updated_at timestamptz) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_variant record;
  v_loyalty_points_rate numeric;
  v_customer_loyalty_points numeric;
BEGIN
  -- Get store's loyalty points rate
  SELECT loyalty_points_rate INTO v_loyalty_points_rate
  FROM store_settings
  WHERE store_name = p_store_name;

  IF v_loyalty_points_rate IS NULL THEN
    RAISE EXCEPTION 'Store % not found or loyalty points rate not set', p_store_name;
  END IF;

  -- Get customer's available loyalty points
  SELECT loyalty_points INTO v_customer_loyalty_points
  FROM customers
  WHERE id = p_customer_id;

  -- Validate loyalty points if being used
  IF p_loyalty_points_used > 0 THEN
    IF v_customer_loyalty_points < p_loyalty_points_used THEN
      RAISE EXCEPTION 'Insufficient loyalty points: Customer has % points, trying to use % points',
        v_customer_loyalty_points, p_loyalty_points_used;
    END IF;
  END IF;

  -- Input validation
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- Create the order
  INSERT INTO orders (
    store_name,
    customer_id,
    status,
    subtotal,
    discount,
    points_discount,
    shipping,
    tax,
    total,
    notes,
    tags,
    applied_coupons,
    loyalty_points_used,
    loyalty_points_rate,
    shipping_address_id,
    billing_address_id
  ) VALUES (
    p_store_name,
    p_customer_id,
    p_status,
    p_subtotal,
    p_discount,
    p_points_discount,
    p_shipping,
    p_tax,
    p_total,
    p_notes,
    p_tags,
    p_applied_coupons,
    p_loyalty_points_used,
    v_loyalty_points_rate,
    p_shipping_address_id,
    p_billing_address_id
  ) RETURNING orders.id INTO v_order_id;

  -- Update customer's loyalty points if points were used
  IF p_loyalty_points_used > 0 THEN
    UPDATE customers
    SET 
      loyalty_points = loyalty_points - p_loyalty_points_used,
      updated_at = now()
    WHERE id = p_customer_id;
  END IF;

  -- Process each order item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Lock and validate variant
    SELECT pv.*, p.track_quantity, p.status
    INTO v_variant
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = (v_item->>'variant_id')::uuid
    FOR UPDATE;

    IF v_variant IS NULL THEN
      RAISE EXCEPTION 'Variant % not found', (v_item->>'variant_id')::uuid;
    END IF;

    IF v_variant.status != 'active' THEN
      RAISE EXCEPTION 'Product variant % is not active', v_variant.name;
    END IF;

    -- Check stock if tracking is enabled
    IF v_variant.track_quantity THEN
      IF v_variant.quantity < (v_item->>'quantity')::integer THEN
        RAISE EXCEPTION 'Insufficient stock for variant %: % available, % requested',
          v_variant.name, v_variant.quantity, (v_item->>'quantity')::integer;
      END IF;

      -- Update variant stock
      UPDATE product_variants
      SET 
        quantity = quantity - (v_item->>'quantity')::integer,
        updated_at = now()
      WHERE id = v_variant.id;
    END IF;

    -- Create order item
    INSERT INTO order_items (
      order_id,
      variant_id,
      quantity,
      price,
      total,
      points_based_price
    ) VALUES (
      v_order_id,
      v_variant.id,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::decimal,
      (v_item->>'total')::decimal,
      (v_item->>'points_based_price')::decimal
    );
  END LOOP;

  -- Return the created order details
  RETURN QUERY
  SELECT 
    orders.id,
    orders.created_at,
    orders.updated_at
  FROM orders
  WHERE orders.id = v_order_id;
END;
$$; 

-- Update place_order function
DROP FUNCTION IF EXISTS place_order(
  p_store_name text,
  p_customer_id uuid,
  p_status text,
  p_subtotal numeric,
  p_shipping numeric,
  p_tax numeric,
  p_total numeric,
  p_notes text,
  p_tags text[],
  p_applied_coupons jsonb,
  p_loyalty_points_used numeric,
  p_items jsonb
);

CREATE OR REPLACE FUNCTION place_order(
  p_store_name text,
  p_customer_id uuid,
  p_status text,
  p_subtotal numeric,
  p_shipping numeric,
  p_tax numeric,
  p_total numeric,
  p_notes text,
  p_tags text[],
  p_applied_coupons jsonb,
  p_loyalty_points_used numeric,
  p_shipping_address_id uuid,
  p_billing_address_id uuid,
  p_items jsonb
) RETURNS TABLE(order_id uuid, order_created_at timestamptz, order_updated_at timestamptz) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_variant record;
  v_loyalty_points_rate numeric;
  v_customer_loyalty_points numeric;
  v_points_discount numeric;
  v_points_required numeric;
  v_standard_price_total numeric;
  v_reward_item_money_required numeric;
  v_coupon_discount numeric;
BEGIN
  -- Get store's loyalty points rate
  SELECT loyalty_points_rate INTO v_loyalty_points_rate
  FROM store_settings
  WHERE store_name = p_store_name;

  IF v_loyalty_points_rate IS NULL THEN
    RAISE EXCEPTION 'Store % not found or loyalty points rate not set', p_store_name;
  END IF;

  -- Get customer's available loyalty points
  SELECT loyalty_points INTO v_customer_loyalty_points
  FROM customers
  WHERE id = p_customer_id;

  -- Calculate points requirements and totals
  v_points_required := 0;
  v_standard_price_total := 0;
  v_reward_item_money_required := 0;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF (v_item->>'points_based_price')::numeric > 0 THEN
      v_points_required := v_points_required + (v_item->>'points_based_price')::numeric * (v_item->>'quantity')::integer;
      v_reward_item_money_required := v_reward_item_money_required + (v_item->>'price')::numeric * (v_item->>'quantity')::integer;
    ELSE
      v_standard_price_total := v_standard_price_total + (v_item->>'price')::numeric * (v_item->>'quantity')::integer;
    END IF;
  END LOOP;

  -- Calculate coupon discount
  v_coupon_discount := COALESCE((
    SELECT SUM(value::numeric)
    FROM jsonb_array_elements(p_applied_coupons) AS coupons(value)
    WHERE value->>'discount' IS NOT NULL
  ), 0);

  -- Validate loyalty points if being used
  IF p_loyalty_points_used > 0 THEN
    IF v_customer_loyalty_points < p_loyalty_points_used THEN
      RAISE EXCEPTION 'Insufficient loyalty points: Customer has % points, trying to use % points',
        v_customer_loyalty_points, p_loyalty_points_used;
    END IF;

    -- Calculate points discount based on frontend logic
    IF p_loyalty_points_used >= v_points_required THEN
      -- Calculate remaining points after covering reward items
      DECLARE
        v_remaining_points numeric := p_loyalty_points_used - v_points_required;
        v_standard_points_discount numeric;
      BEGIN
        -- Calculate standard points discount
        v_standard_points_discount := LEAST(
          v_standard_price_total,
          v_remaining_points / v_loyalty_points_rate
        );
        
        -- Total points discount is reward items cost plus standard points discount
        v_points_discount := v_reward_item_money_required + v_standard_points_discount;
      END;
    ELSE
      RAISE EXCEPTION 'Insufficient loyalty points: Need % points for reward items, but only % points used',
        v_points_required, p_loyalty_points_used;
    END IF;
  ELSE
    v_points_discount := 0;
  END IF;

  -- Input validation
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- Create the order
  INSERT INTO orders (
    store_name,
    customer_id,
    status,
    subtotal,
    shipping,
    tax,
    total,
    notes,
    tags,
    applied_coupons,
    loyalty_points_used,
    points_discount,
    shipping_address_id,
    billing_address_id
  ) VALUES (
    p_store_name,
    p_customer_id,
    p_status,
    p_subtotal,
    p_shipping,
    p_tax,
    p_total,
    p_notes,
    p_tags,
    p_applied_coupons,
    p_loyalty_points_used,
    v_points_discount,
    p_shipping_address_id,
    p_billing_address_id
  ) RETURNING orders.id INTO v_order_id;

  -- Process each order item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Lock and validate variant
    SELECT pv.*, p.track_quantity, p.status
    INTO v_variant
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = (v_item->>'variant_id')::uuid
    FOR UPDATE;

    IF v_variant IS NULL THEN
      RAISE EXCEPTION 'Variant % not found', (v_item->>'variant_id')::uuid;
    END IF;

    IF v_variant.status != 'active' THEN
      RAISE EXCEPTION 'Product variant % is not active', v_variant.name;
    END IF;

    -- Check stock if tracking is enabled
    IF v_variant.track_quantity THEN
      IF v_variant.quantity < (v_item->>'quantity')::integer THEN
        RAISE EXCEPTION 'Insufficient stock for variant %: % available, % requested',
          v_variant.name, v_variant.quantity, (v_item->>'quantity')::integer;
      END IF;

      -- Update variant stock
      UPDATE product_variants
      SET 
        quantity = quantity - (v_item->>'quantity')::integer,
        updated_at = now()
      WHERE id = v_variant.id;
    END IF;

    -- Create order item
    INSERT INTO order_items (
      order_id,
      variant_id,
      quantity,
      price,
      total,
      points_based_price
    ) VALUES (
      v_order_id,
      v_variant.id,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::decimal,
      (v_item->>'total')::decimal,
      (v_item->>'points_based_price')::decimal
    );
  END LOOP;

  -- If loyalty points were used, deduct them from customer
  IF p_loyalty_points_used > 0 THEN
    UPDATE customers
    SET 
      loyalty_points = loyalty_points - p_loyalty_points_used,
      updated_at = now()
    WHERE id = p_customer_id;
  END IF;

  -- Return the created order details
  RETURN QUERY
  SELECT 
    orders.id,
    orders.created_at,
    orders.updated_at
  FROM orders
  WHERE orders.id = v_order_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION place_order TO authenticated;
GRANT EXECUTE ON FUNCTION place_order TO anon;

-- Add helpful comment
COMMENT ON FUNCTION place_order IS 'Creates an order with items, handles inventory updates, and processes loyalty points in a single transaction'; 