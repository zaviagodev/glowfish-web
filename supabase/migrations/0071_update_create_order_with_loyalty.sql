/*
# Add points_discount column to orders table

1. Changes
- Add points_discount column to orders table
- Update existing orders to set points_discount 
- Add helpful comment explaining the column

2. Notes
- points_discount will track the discount amount from loyalty points
- Existing orders will have their points_discount set to 0
 */
-- Add points_discount column
ALTER TABLE orders
ADD COLUMN points_discount numeric DEFAULT 0;

-- Add helpful comment
COMMENT ON COLUMN orders.points_discount IS 'Total discount amount from loyalty points';

-- Add index for efficient querying
CREATE INDEX orders_points_discount_idx ON orders (points_discount);

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
    loyalty_points_rate
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
    v_loyalty_points_rate
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