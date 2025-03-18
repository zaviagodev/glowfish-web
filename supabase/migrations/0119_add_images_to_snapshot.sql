-- Add product images to order item snapshots
CREATE OR REPLACE FUNCTION populate_order_item_snapshots()
RETURNS TRIGGER AS $$
BEGIN
  -- Get variant, product and images data
  WITH variant_data AS (
    SELECT 
      pv.*,
      p.name as product_name,
      p.sku as product_sku,
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'url', pi.url,
              'alt', pi.alt,
              'position', pi.position,
              'path', pi.path
            ) ORDER BY pi.position
          )
          FROM product_images pi
          WHERE pi.product_id = p.id
        ),
        '[]'::jsonb
      ) as product_images
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = NEW.variant_id
  )
  SELECT 
    product_id,
    jsonb_build_object(
      'id', id,
      'name', name,
      'sku', sku,
      'options', options
    ),
    jsonb_build_object(
      'id', product_id,
      'name', product_name,
      'sku', product_sku,
      'images', product_images
    )
  INTO 
    NEW.product_id,
    NEW.variant_snapshot,
    NEW.product_snapshot
  FROM variant_data;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION populate_order_item_snapshots IS 'Automatically populates product and variant snapshot data when creating order items'; 