-- Add meta_data column to order_items
ALTER TABLE order_items
  ADD COLUMN meta_data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Update populate_order_item_snapshots function
CREATE OR REPLACE FUNCTION populate_order_item_snapshots()
RETURNS TRIGGER AS $$
BEGIN
  -- Get variant, product and images data
  WITH variant_data AS (
    SELECT 
      pv.*,
      p.name as product_name,
      p.sku as product_sku,
      p.is_reward,
      p.is_gift,
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
      ) as product_images,
      EXISTS (
        SELECT 1 
        FROM events e 
        WHERE e.product_id = p.id
      ) as has_event
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
    ),
    jsonb_build_object(
      'reward', is_reward,
      'gift', is_gift,
      'event', has_event
    )
  INTO 
    NEW.product_id,
    NEW.variant_snapshot,
    NEW.product_snapshot,
    NEW.meta_data
  FROM variant_data;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON COLUMN order_items.meta_data IS 'Additional metadata about the order item like reward/gift/event flags'; 

-- Populate meta_data for existing order_items
WITH variant_data AS (
  SELECT 
    oi.id as order_item_id,
    p.is_reward,
    p.is_gift,
    EXISTS (
      SELECT 1 
      FROM events e 
      WHERE e.product_id = p.id
    ) as has_event
  FROM order_items oi
  JOIN product_variants pv ON pv.id = oi.variant_id
  JOIN products p ON p.id = pv.product_id
)
UPDATE order_items oi
SET meta_data = jsonb_build_object(
  'reward', vd.is_reward,
  'gift', vd.is_gift,
  'event', vd.has_event
)
FROM variant_data vd
WHERE oi.id = vd.order_item_id; 