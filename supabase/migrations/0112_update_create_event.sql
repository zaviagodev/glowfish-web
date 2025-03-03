/*
# Update Event Function

1. Changes
  - Update functions to handle new stores table
*/


-- Drop existing functions
DROP FUNCTION IF EXISTS create_event;

-- Function to create an event with its product
CREATE OR REPLACE FUNCTION create_event(
  p_store_name text,
  -- Required Product fields
  p_name text,
  p_price numeric,
  p_weight numeric,
  p_weight_unit text,
  p_status text,
  p_track_quantity boolean,
  -- Required Event fields
  p_start_datetime timestamptz,
  p_end_datetime timestamptz,
  p_venue_name text,
  p_venue_address text,
  p_organizer_name text,
  p_organizer_contact text,
  p_attendance_points integer DEFAULT 0,
  -- Optional Product fields
  p_is_reward boolean DEFAULT false,
  p_description text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_compare_at_price numeric DEFAULT NULL,
  p_cost numeric DEFAULT NULL,
  p_sku text DEFAULT NULL,
  p_barcode text DEFAULT NULL,
  p_variant_options jsonb DEFAULT '[]'::jsonb,
  p_variants jsonb DEFAULT '[]'::jsonb,
  p_images jsonb DEFAULT '[]'::jsonb,
  p_tags text[] DEFAULT ARRAY[]::text[],
  -- Optional Event fields
  p_google_maps_link text DEFAULT NULL,
  p_gallery_link text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_id uuid;
  v_event_id uuid;
  v_product jsonb;
  v_event jsonb;
  v_variant record;
  v_image record;
BEGIN
  -- Validate store exists
  IF NOT EXISTS (SELECT 1 FROM stores WHERE name = p_store_name) THEN
    RAISE EXCEPTION 'Store not found';
  END IF;

  -- Start transaction
  BEGIN
    -- Create product first
    INSERT INTO products (
      store_name,
      name,
      description,
      category_id,
      price,
      compare_at_price,
      cost,
      sku,
      barcode,
      track_quantity,
      weight,
      weight_unit,
      status,
      variant_options,
      is_reward
    ) VALUES (
      p_store_name,
      p_name,
      p_description,
      p_category_id,
      p_price,
      p_compare_at_price,
      p_cost,
      p_sku,
      p_barcode,
      p_track_quantity,
      p_weight,
      p_weight_unit,
      p_status,
      p_variant_options,
      p_is_reward
    )
    RETURNING id INTO v_product_id;

    -- Create variants if provided
    IF jsonb_array_length(p_variants) > 0 THEN
      FOR v_variant IN SELECT value FROM jsonb_array_elements(p_variants)
      LOOP
        INSERT INTO product_variants (
          product_id,
          name,
          sku,
          price,
          points_based_price,
          compare_at_price,
          quantity,
          options,
          status,
          position
        ) VALUES (
          v_product_id,
          v_variant.value->>'name',
          v_variant.value->>'sku',
          (v_variant.value->>'price')::numeric,
          (v_variant.value->>'pointsBasedPrice')::numeric,
          (v_variant.value->>'compareAtPrice')::numeric,
          COALESCE((v_variant.value->>'quantity')::integer, 0),
          COALESCE((v_variant.value->'options')::jsonb, '[]'::jsonb),
          COALESCE(v_variant.value->>'status', 'active'),
          COALESCE((v_variant.value->>'position')::integer, 0)
        );
      END LOOP;
    END IF;

    -- Create images if provided
    IF jsonb_array_length(p_images) > 0 THEN
      FOR v_image IN SELECT value FROM jsonb_array_elements(p_images)
      LOOP
        INSERT INTO product_images (
          product_id,
          url,
          alt,
          position
        ) VALUES (
          v_product_id,
          v_image.value->>'url',
          COALESCE(v_image.value->>'alt', ''),
          COALESCE((v_image.value->>'position')::integer, 0)
        );
      END LOOP;
    END IF;

    -- Create product tags if provided
    IF array_length(p_tags, 1) > 0 THEN
      INSERT INTO product_tags (product_id, store_name, name)
      SELECT v_product_id, p_store_name, unnest(p_tags);
    END IF;

    -- Create event
    INSERT INTO events (
      product_id,
      store_name,
      start_datetime,
      end_datetime,
      venue_name,
      venue_address,
      google_maps_link,
      gallery_link,
      organizer_name,
      organizer_contact,
      attendance_points
    ) VALUES (
      v_product_id,
      p_store_name,
      p_start_datetime,
      p_end_datetime,
      p_venue_name,
      p_venue_address,
      p_google_maps_link,
      p_gallery_link,
      p_organizer_name,
      p_organizer_contact,
      p_attendance_points
    )
    RETURNING id INTO v_event_id;

    -- Get the created product with its relationships
    SELECT jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'description', p.description,
      'category', CASE 
        WHEN pc.id IS NOT NULL THEN jsonb_build_object(
          'id', pc.id,
          'name', pc.name,
          'slug', pc.slug
        )
        ELSE null
      END,
      'price', p.price,
      'compareAtPrice', p.compare_at_price,
      'cost', p.cost,
      'sku', p.sku,
      'barcode', p.barcode,
      'trackQuantity', p.track_quantity,
      'weight', p.weight,
      'weightUnit', p.weight_unit,
      'status', p.status,
      'variantOptions', p.variant_options,
      'isReward', p.is_reward,
      'variants', COALESCE(
        (
          SELECT jsonb_agg(result)
          FROM (
            SELECT jsonb_build_object(
              'id', pv.id,
              'name', pv.name,
              'sku', pv.sku,
              'price', pv.price,
              'pointsBasedPrice', pv.points_based_price,
              'compareAtPrice', pv.compare_at_price,
              'quantity', pv.quantity,
              'options', pv.options,
              'status', pv.status,
              'position', pv.position
            ) AS result
            FROM product_variants pv
            WHERE pv.product_id = p.id
            ORDER BY pv.position
          ) ordered_variants
        ),
        '[]'::jsonb
      ),
      'images', COALESCE(
        (
          SELECT jsonb_agg(result)
          FROM (
            SELECT jsonb_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt', pi.alt,
              'position', pi.position
            ) AS result
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.position
          ) ordered_images
        ),
        '[]'::jsonb
      ),
      'tags', COALESCE(
        (
          SELECT jsonb_agg(jsonb_build_object(
            'id', pt.id,
            'name', pt.name
          ))
          FROM product_tags pt
          WHERE pt.product_id = p.id
        ),
        '[]'::jsonb
      ),
      'createdAt', p.created_at,
      'updatedAt', p.updated_at
    ) INTO v_product
    FROM products p
    LEFT JOIN product_categories pc ON pc.id = p.category_id
    WHERE p.id = v_product_id;

    -- Get the created event
    SELECT jsonb_build_object(
      'id', e.id,
      'productId', e.product_id,
      'storeName', e.store_name,
      'startDateTime', e.start_datetime,
      'endDateTime', e.end_datetime,
      'venueName', e.venue_name,
      'venueAddress', e.venue_address,
      'googleMapsLink', e.google_maps_link,
      'galleryLink', e.gallery_link,
      'organizerName', e.organizer_name,
      'organizerContact', e.organizer_contact,
      'attendancePoints', e.attendance_points,
      'createdAt', e.created_at,
      'updatedAt', e.updated_at
    ) INTO v_event
    FROM events e
    WHERE e.id = v_event_id;

    -- Return combined result
    RETURN jsonb_build_object(
      'product', v_product,
      'event', v_event
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE;
  END;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_event TO authenticated;