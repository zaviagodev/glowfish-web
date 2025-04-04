-- Add shipping_option column to orders table
ALTER TABLE orders
ADD COLUMN shipping_option jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN orders.shipping_option IS 'The ID of the selected shipping option';

-- Drop duplicate create_order functions
DROP FUNCTION IF EXISTS create_order(text, uuid, text, numeric, numeric, numeric, numeric, numeric, text, text[], jsonb, numeric, jsonb, uuid, uuid, uuid);
DROP FUNCTION IF EXISTS create_order(text, uuid, text, numeric, numeric, numeric, numeric, numeric, text, text[], jsonb, numeric, uuid, uuid, jsonb);
DROP FUNCTION IF EXISTS create_order(text, uuid, text, numeric, numeric, numeric, numeric, numeric, text, text[], jsonb);
DROP FUNCTION IF EXISTS create_order(text, uuid, text, numeric, numeric, numeric, numeric, numeric, text);
DROP FUNCTION IF EXISTS create_order(
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
  p_items jsonb
);

DROP FUNCTION IF EXISTS create_order(
  p_store_name text,
  p_customer_id uuid,
  p_status text,
  p_subtotal numeric,
  p_discount numeric,
  p_shipping numeric,
  p_tax numeric,
  p_total numeric,
  p_notes text,
  p_tags text[],
  p_applied_coupons jsonb,
  p_items jsonb
);

DROP FUNCTION IF EXISTS create_order(
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
);

DROP FUNCTION IF EXISTS create_order(
  p_store_name text,
  p_customer_id uuid,
  p_status text,
  p_subtotal numeric,
  p_discount numeric,
  p_shipping numeric,
  p_tax numeric,
  p_total numeric,
  p_notes text,
  p_tags text[],
  p_applied_coupons jsonb,
  p_loyalty_points_used numeric,
  p_items jsonb,
  p_shipping_address_id uuid,
  p_billing_address_id uuid
);

-- Drop duplicate place_order functions
DROP FUNCTION IF EXISTS place_order(text, uuid, text, numeric, numeric, numeric, numeric, text, text[], jsonb, numeric, jsonb, uuid, uuid);
DROP FUNCTION IF EXISTS place_order(text, uuid, text, numeric, numeric, numeric, numeric, text, text[], jsonb, numeric, uuid, uuid, jsonb);
DROP FUNCTION IF EXISTS place_order(text, uuid, text, numeric, numeric, numeric, numeric, text, text[], jsonb, uuid, uuid, jsonb);
DROP FUNCTION IF EXISTS place_order(text, uuid, text, numeric, numeric, numeric, numeric, text, text[], jsonb);
DROP FUNCTION IF EXISTS place_order(text, uuid, text, numeric, numeric, numeric, numeric, text);

-- Update create_order function to handle points transactions
CREATE OR REPLACE FUNCTION create_order(
  p_store_name text,
  p_customer_id uuid,
  p_status text,
  p_subtotal numeric,
  p_discount numeric,
  p_shipping numeric,
  p_tax numeric,
  p_total numeric,
  p_notes text,
  p_tags text[],
  p_applied_coupons jsonb,
  p_loyalty_points_used numeric,
  p_items jsonb,
  p_shipping_address_id uuid DEFAULT NULL,
  p_billing_address_id uuid DEFAULT NULL,
  p_shipping_option_id uuid DEFAULT NULL
) RETURNS TABLE(order_id uuid, order_created_at timestamptz, order_updated_at timestamptz) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_order_total numeric;
  v_item jsonb;
  v_variant record;
  v_loyalty_points_rate numeric;
  v_points_discount numeric;
  v_points_required numeric;
  v_standard_price_total numeric;
  v_reward_item_money_required numeric;
  v_coupon_discount numeric;
  v_customer_loyalty_points numeric;
  v_has_physical_products boolean := false;
  v_shipping_option jsonb;
  v_fixed_shipping_rate_enabled boolean;
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

  -- Calculate points discount based on frontend logic
  IF p_loyalty_points_used > 0 THEN
    IF v_customer_loyalty_points < p_loyalty_points_used THEN
      RAISE EXCEPTION 'Insufficient loyalty points: Customer has % points, trying to use % points',
        v_customer_loyalty_points, p_loyalty_points_used;
    END IF;

    IF p_loyalty_points_used >= v_points_required THEN
      -- Calculate remaining points after covering reward items
      v_points_discount := v_reward_item_money_required + LEAST(
        v_standard_price_total,
        (p_loyalty_points_used - v_points_required) / v_loyalty_points_rate
      );
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

  -- Check if order contains any non-event products
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT pv.*, p.id as product_id
    INTO v_variant
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = (v_item->>'variant_id')::uuid;

    -- Check if this product is an event
    IF NOT EXISTS (
      SELECT 1 
      FROM products p 
      WHERE p.is_reward = true AND p.id = v_variant.product_id
    ) THEN
      v_has_physical_products := true;
      EXIT;
    END IF;
  END LOOP;

  -- Validate shipping and billing addresses if there are physical products
  IF v_has_physical_products THEN
    IF p_shipping_address_id IS NULL THEN
      RAISE EXCEPTION 'Shipping address is required for orders with physical products';
    END IF;
    IF p_billing_address_id IS NULL THEN
      RAISE EXCEPTION 'Billing address is required for orders with physical products';
    END IF;
  END IF;

  -- Validate shipping option if provided
  IF p_shipping_option_id IS NOT NULL THEN

    SELECT option INTO v_shipping_option
    FROM store_settings,
         jsonb_array_elements(shipping_options) AS option
    WHERE store_name = p_store_name
    AND (option->>'id')::uuid = p_shipping_option_id;

    IF v_shipping_option IS NULL THEN
      RAISE EXCEPTION 'Invalid shipping option ID: %', p_shipping_option_id;
    END IF;

    -- set the rate to the shipping option rate
    p_shipping := (v_shipping_option->>'rate')::numeric;
  ELSE
  END IF;
   
  -- Get check if fixed shipping rate is enabled
  SELECT fixed_shipping_rate_enabled INTO v_fixed_shipping_rate_enabled
  FROM store_settings
  WHERE store_name = p_store_name;
  
  IF v_fixed_shipping_rate_enabled THEN
    -- Get default shipping option
    p_shipping := (SELECT fixed_shipping_rate_amount FROM store_settings WHERE store_name = p_store_name);
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
    billing_address_id,
    shipping_option
  ) VALUES (
    p_store_name,
    p_customer_id,
    p_status,
    p_subtotal,
    p_discount,
    v_points_discount,
    p_shipping,
    p_tax,
    p_total,
    p_notes,
    p_tags,
    p_applied_coupons,
    p_loyalty_points_used,
    v_loyalty_points_rate,
    p_shipping_address_id,
    p_billing_address_id,
    v_shipping_option
  ) RETURNING orders.id INTO v_order_id;

  -- Update customer's loyalty points if points were used
  IF p_loyalty_points_used > 0 THEN
    -- Add points transaction entry for redemption
    INSERT INTO points_transactions (
      store_name,
      customer_id,
      points,
      type,
      order_id,
      description
    ) VALUES (
      p_store_name,
      p_customer_id,
      -p_loyalty_points_used,
      'redeem',
      v_order_id,
      'Points redeemed for order: ' || v_order_id
    );
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

  -- get the order total
  SELECT total INTO v_order_total
  FROM orders
  WHERE id = v_order_id;

  -- if the order total is 0, set the status to processing
  IF v_order_total = 0 THEN
    UPDATE orders
    SET status = 'processing'
    WHERE id = v_order_id;
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
  p_items jsonb,
  p_shipping_address_id uuid DEFAULT NULL,
  p_billing_address_id uuid DEFAULT NULL,
  p_shipping_option_id uuid DEFAULT NULL
) RETURNS TABLE(order_id uuid, order_created_at timestamptz, order_updated_at timestamptz) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_variant record;
  v_order_total numeric;
  v_loyalty_points_rate numeric;
  v_customer_loyalty_points numeric;
  v_points_discount numeric;
  v_points_required numeric;
  v_standard_price_total numeric;
  v_reward_item_money_required numeric;
  v_coupon_discount numeric;
  v_has_physical_products boolean := false;
  v_shipping_option jsonb;
  v_fixed_shipping_rate_enabled boolean;
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

  -- Calculate points discount based on frontend logic
  IF p_loyalty_points_used > 0 THEN
    IF v_customer_loyalty_points < p_loyalty_points_used THEN
      RAISE EXCEPTION 'Insufficient loyalty points: Customer has % points, trying to use % points',
        v_customer_loyalty_points, p_loyalty_points_used;
    END IF;

    IF p_loyalty_points_used >= v_points_required THEN
      -- Calculate remaining points after covering reward items
      v_points_discount := v_reward_item_money_required + LEAST(
        v_standard_price_total,
        (p_loyalty_points_used - v_points_required) / v_loyalty_points_rate
      );
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

  -- Check if order contains any non-event products
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT pv.*, p.id as product_id
    INTO v_variant
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = (v_item->>'variant_id')::uuid;

    -- Check if this product is an event
    IF NOT EXISTS (
      SELECT 1 
      FROM products p 
      WHERE p.is_reward = true AND p.id = v_variant.product_id
    ) THEN
      v_has_physical_products := true;
      EXIT;
    END IF;
  END LOOP;

  -- Validate shipping and billing addresses if there are physical products
  IF v_has_physical_products THEN
    IF p_shipping_address_id IS NULL THEN
      RAISE EXCEPTION 'Shipping address is required for orders with physical products';
    END IF;
    IF p_billing_address_id IS NULL THEN
      RAISE EXCEPTION 'Billing address is required for orders with physical products';
    END IF;
  END IF;

  -- Validate shipping option if provided
  IF p_shipping_option_id IS NOT NULL THEN
    -- Get check if fixed shipping rate is enabled
    SELECT fixed_shipping_rate_enabled INTO v_fixed_shipping_rate_enabled
    FROM store_settings
    WHERE store_name = p_store_name;
    
    IF v_fixed_shipping_rate_enabled THEN
      -- Get default shipping option
      p_shipping := (SELECT fixed_shipping_rate_amount FROM store_settings WHERE store_name = p_store_name);
    END IF;

    SELECT option INTO v_shipping_option
    FROM store_settings,
         jsonb_array_elements(shipping_options) AS option
    WHERE store_name = p_store_name
    AND (option->>'id')::uuid = p_shipping_option_id;

    IF v_shipping_option IS NULL THEN
      RAISE EXCEPTION 'Invalid shipping option ID: %', p_shipping_option_id;
    END IF;

    -- set the rate to the shipping option rate
    p_shipping := (v_shipping_option->>'rate')::numeric;
  ELSE
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
    billing_address_id,
    shipping_option
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
    p_billing_address_id,
    v_shipping_option
  ) RETURNING orders.id INTO v_order_id;

  -- Update customer's loyalty points if points were used
  IF p_loyalty_points_used > 0 THEN
    -- Add points transaction entry for redemption
    INSERT INTO points_transactions (
      store_name,
      customer_id,
      points,
      type,
      order_id,
      description
    ) VALUES (
      p_store_name,
      p_customer_id,
      -p_loyalty_points_used,
      'redeem',
      v_order_id,
      'Points redeemed for order: ' || v_order_id
    );
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

  -- If loyalty points were used, deduct them from customer
  IF p_loyalty_points_used > 0 THEN
    UPDATE customers
    SET 
      loyalty_points = loyalty_points - p_loyalty_points_used,
      updated_at = now()
    WHERE id = p_customer_id;
  END IF;

  -- get the order total
  SELECT total INTO v_order_total
  FROM orders
  WHERE id = v_order_id;

  -- if the order total is 0, set the status to processing
  IF v_order_total = 0 THEN
    UPDATE orders
    SET status = 'processing'
    WHERE id = v_order_id;
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