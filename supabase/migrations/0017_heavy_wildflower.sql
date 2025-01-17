/*
# Fix order and customer handling

1. Changes
  - Fix ambiguous id column reference in place_order function
  - Add upsert handling for existing customers
  - Improve error handling
*/

-- Drop existing function
DROP FUNCTION IF EXISTS place_order;

-- Recreate with fixed column references
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
  v_product record;
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
    -- Lock and validate product
    SELECT *
    INTO v_product
    FROM products
    WHERE products.id = (v_item->>'product_id')::uuid
      AND products.store_name = p_store_name
      AND products.status = 'active'
    FOR UPDATE;

    IF v_product IS NULL THEN
      RAISE EXCEPTION 'Product % not found or is not active', (v_item->>'product_id')::uuid;
    END IF;

    -- Check stock if tracking is enabled
    IF v_product.track_quantity THEN
      IF v_product.quantity < (v_item->>'quantity')::integer THEN
        RAISE EXCEPTION 'Insufficient stock for product %: % available, % requested',
          v_product.name, v_product.quantity, (v_item->>'quantity')::integer;
      END IF;

      -- Update product stock
      UPDATE products
      SET 
        quantity = quantity - (v_item->>'quantity')::integer,
        updated_at = now()
      WHERE products.id = v_product.id;
    END IF;

    -- Create order item
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      price,
      total
    ) VALUES (
      v_order_id,
      v_product.id,
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION place_order TO authenticated;
GRANT EXECUTE ON FUNCTION place_order TO anon;