/*
# Fix Event Functions Signatures

1. Changes
  - Update create_event and update_event functions to include all product and event properties
  - Make all parameters optional for update_event function
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS create_event;
DROP FUNCTION IF EXISTS update_event;

-- Function to create an event with its product
CREATE OR REPLACE FUNCTION create_event(
  p_store_name text,
  -- Product fields
  p_name text,
  p_description text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_price numeric DEFAULT 0,
  p_compare_at_price numeric DEFAULT NULL,
  p_cost numeric DEFAULT NULL,
  p_sku text DEFAULT NULL,
  p_barcode text DEFAULT NULL,
  p_track_quantity boolean DEFAULT false,
  p_weight numeric DEFAULT 0,
  p_weight_unit text DEFAULT 'kg',
  p_status text DEFAULT 'draft',
  p_variant_options jsonb DEFAULT '[]'::jsonb,
  p_variants jsonb DEFAULT '[]'::jsonb,
  p_images jsonb DEFAULT '[]'::jsonb,
  p_tags text[] DEFAULT ARRAY[]::text[],
  -- Event fields
  p_start_datetime timestamptz DEFAULT now(),
  p_end_datetime timestamptz DEFAULT now() + interval '1 hour',
  p_venue_name text DEFAULT '',
  p_venue_address text DEFAULT '',
  p_google_maps_link text DEFAULT NULL,
  p_organizer_name text DEFAULT '',
  p_organizer_contact text DEFAULT ''
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_id uuid;
  v_event_id uuid;
  v_product jsonb;
  v_event jsonb;
BEGIN
  -- Validate store exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE store_name = p_store_name) THEN
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
      variants,
      images
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
      p_variants,
      p_images
    )
    RETURNING id INTO v_product_id;

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
      organizer_name,
      organizer_contact
    ) VALUES (
      v_product_id,
      p_store_name,
      p_start_datetime,
      p_end_datetime,
      p_venue_name,
      p_venue_address,
      p_google_maps_link,
      p_organizer_name,
      p_organizer_contact
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
      'variants', p.variants,
      'images', p.images,
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
      'organizerName', e.organizer_name,
      'organizerContact', e.organizer_contact,
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

-- Function to update an event with its product
CREATE OR REPLACE FUNCTION update_event(
  p_event_id uuid,
  p_product_id uuid,
  p_store_name text,
  -- Product fields
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_price numeric DEFAULT NULL,
  p_compare_at_price numeric DEFAULT NULL,
  p_cost numeric DEFAULT NULL,
  p_sku text DEFAULT NULL,
  p_barcode text DEFAULT NULL,
  p_track_quantity boolean DEFAULT NULL,
  p_weight numeric DEFAULT NULL,
  p_weight_unit text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_variant_options jsonb DEFAULT NULL,
  p_variants jsonb DEFAULT NULL,
  p_images jsonb DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  -- Event fields
  p_start_datetime timestamptz DEFAULT NULL,
  p_end_datetime timestamptz DEFAULT NULL,
  p_venue_name text DEFAULT NULL,
  p_venue_address text DEFAULT NULL,
  p_google_maps_link text DEFAULT NULL,
  p_organizer_name text DEFAULT NULL,
  p_organizer_contact text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product jsonb;
  v_event jsonb;
BEGIN
  -- Validate store exists and owns the product/event
  IF NOT EXISTS (
    SELECT 1 
    FROM products p
    JOIN events e ON e.product_id = p.id
    WHERE p.store_name = p_store_name 
    AND p.id = p_product_id 
    AND e.id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Event not found or not owned by store';
  END IF;

  -- Start transaction
  BEGIN
    -- Update product if any product fields are provided
    IF p_name IS NOT NULL OR p_description IS NOT NULL OR p_category_id IS NOT NULL OR
       p_price IS NOT NULL OR p_compare_at_price IS NOT NULL OR p_cost IS NOT NULL OR
       p_sku IS NOT NULL OR p_barcode IS NOT NULL OR p_track_quantity IS NOT NULL OR
       p_weight IS NOT NULL OR p_weight_unit IS NOT NULL OR p_status IS NOT NULL OR
       p_variant_options IS NOT NULL OR p_variants IS NOT NULL OR p_images IS NOT NULL THEN
      
      UPDATE products
      SET
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        category_id = COALESCE(p_category_id, category_id),
        price = COALESCE(p_price, price),
        compare_at_price = COALESCE(p_compare_at_price, compare_at_price),
        cost = COALESCE(p_cost, cost),
        sku = COALESCE(p_sku, sku),
        barcode = COALESCE(p_barcode, barcode),
        track_quantity = COALESCE(p_track_quantity, track_quantity),
        weight = COALESCE(p_weight, weight),
        weight_unit = COALESCE(p_weight_unit, weight_unit),
        status = COALESCE(p_status, status),
        variant_options = COALESCE(p_variant_options, variant_options),
        variants = COALESCE(p_variants, variants),
        images = COALESCE(p_images, images),
        updated_at = now()
      WHERE id = p_product_id;
    END IF;

    -- Update tags if provided
    IF p_tags IS NOT NULL THEN
      -- Delete existing tags
      DELETE FROM product_tags WHERE product_id = p_product_id;
      
      -- Insert new tags
      IF array_length(p_tags, 1) > 0 THEN
        INSERT INTO product_tags (product_id, store_name, name)
        SELECT p_product_id, p_store_name, unnest(p_tags);
      END IF;
    END IF;

    -- Update event if any event fields are provided
    IF p_start_datetime IS NOT NULL OR p_end_datetime IS NOT NULL OR
       p_venue_name IS NOT NULL OR p_venue_address IS NOT NULL OR
       p_google_maps_link IS NOT NULL OR p_organizer_name IS NOT NULL OR
       p_organizer_contact IS NOT NULL THEN
      
      UPDATE events
      SET
        start_datetime = COALESCE(p_start_datetime, start_datetime),
        end_datetime = COALESCE(p_end_datetime, end_datetime),
        venue_name = COALESCE(p_venue_name, venue_name),
        venue_address = COALESCE(p_venue_address, venue_address),
        google_maps_link = COALESCE(p_google_maps_link, google_maps_link),
        organizer_name = COALESCE(p_organizer_name, organizer_name),
        organizer_contact = COALESCE(p_organizer_contact, organizer_contact),
        updated_at = now()
      WHERE id = p_event_id;
    END IF;

    -- Get the updated product with its relationships
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
      'variants', p.variants,
      'images', p.images,
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
    WHERE p.id = p_product_id;

    -- Get the updated event
    SELECT jsonb_build_object(
      'id', e.id,
      'productId', e.product_id,
      'storeName', e.store_name,
      'startDateTime', e.start_datetime,
      'endDateTime', e.end_datetime,
      'venueName', e.venue_name,
      'venueAddress', e.venue_address,
      'googleMapsLink', e.google_maps_link,
      'organizerName', e.organizer_name,
      'organizerContact', e.organizer_contact,
      'createdAt', e.created_at,
      'updatedAt', e.updated_at
    ) INTO v_event
    FROM events e
    WHERE e.id = p_event_id;

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
GRANT EXECUTE ON FUNCTION update_event TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION create_event IS 'Creates a new event and its associated product in a single transaction';
COMMENT ON FUNCTION update_event IS 'Updates an existing event and its associated product in a single transaction'; 