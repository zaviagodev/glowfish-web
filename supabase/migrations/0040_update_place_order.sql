-- supabase/migrations/0040_update_place_order.sql
CREATE OR REPLACE FUNCTION place_order(
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
  p_items jsonb
) RETURNS TABLE(order_id uuid, order_created_at timestamptz, order_updated_at timestamptz) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_variant record;
BEGIN
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
    shipping,
    tax,
    total,
    notes,
    tags
  ) VALUES (
    p_store_name,
    p_customer_id,
    p_status,
    p_subtotal,
    p_discount,
    p_shipping,
    p_tax,
    p_total,
    p_notes,
    p_tags
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
      total
    ) VALUES (
      v_order_id,
      v_variant.id,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::decimal,
      (v_item->>'total')::decimal
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
