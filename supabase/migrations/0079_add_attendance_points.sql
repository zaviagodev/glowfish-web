/*
# Add Attendance Points to Events

1. Changes
  - Add attendance_points column to events table
  - Update functions to handle attendance_points
*/

-- Add attendance_points column to events table
ALTER TABLE events
ADD COLUMN attendance_points INTEGER DEFAULT 0 NOT NULL;

-- Add comment for the new column
COMMENT ON COLUMN events.attendance_points IS 'Points awarded for attending this event';

-- Drop existing functions
DROP FUNCTION IF EXISTS create_event;
DROP FUNCTION IF EXISTS update_event;
DROP FUNCTION IF EXISTS get_customer_events;

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
  p_google_maps_link text DEFAULT NULL
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
      variant_options
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
      p_variant_options
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
      'variants', COALESCE(
        (
          SELECT jsonb_agg(result)
          FROM (
            SELECT jsonb_build_object(
              'id', pv.id,
              'name', pv.name,
              'sku', pv.sku,
              'price', pv.price,
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

-- Function to update an event with its product
CREATE OR REPLACE FUNCTION update_event(
  -- Required fields
  p_event_id uuid,
  p_product_id uuid,
  p_store_name text,
  -- Optional Product fields
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
  -- Optional Event fields
  p_start_datetime timestamptz DEFAULT NULL,
  p_end_datetime timestamptz DEFAULT NULL,
  p_venue_name text DEFAULT NULL,
  p_venue_address text DEFAULT NULL,
  p_google_maps_link text DEFAULT NULL,
  p_organizer_name text DEFAULT NULL,
  p_organizer_contact text DEFAULT NULL,
  p_attendance_points integer DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product jsonb;
  v_event jsonb;
  v_variant record;
  v_image record;
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
       p_variant_options IS NOT NULL THEN
      
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
        updated_at = now()
      WHERE id = p_product_id;
    END IF;

    -- Update variants if provided
    IF p_variants IS NOT NULL THEN
      -- Delete existing variants
      DELETE FROM product_variants WHERE product_id = p_product_id;
      
      -- Insert new variants
      IF jsonb_array_length(p_variants) > 0 THEN
        FOR v_variant IN SELECT value FROM jsonb_array_elements(p_variants)
        LOOP
          INSERT INTO product_variants (
            product_id,
            name,
            sku,
            price,
            compare_at_price,
            quantity,
            options,
            status,
            position
          ) VALUES (
            p_product_id,
            v_variant.value->>'name',
            v_variant.value->>'sku',
            (v_variant.value->>'price')::numeric,
            (v_variant.value->>'compareAtPrice')::numeric,
            COALESCE((v_variant.value->>'quantity')::integer, 0),
            COALESCE((v_variant.value->'options')::jsonb, '[]'::jsonb),
            COALESCE(v_variant.value->>'status', 'active'),
            COALESCE((v_variant.value->>'position')::integer, 0)
          );
        END LOOP;
      END IF;
    END IF;

    -- Update images if provided
    IF p_images IS NOT NULL THEN
      -- Delete existing images
      DELETE FROM product_images WHERE product_id = p_product_id;
      
      -- Insert new images
      IF jsonb_array_length(p_images) > 0 THEN
        FOR v_image IN SELECT value FROM jsonb_array_elements(p_images)
        LOOP
          INSERT INTO product_images (
            product_id,
            url,
            alt,
            position
          ) VALUES (
            p_product_id,
            v_image.value->>'url',
            COALESCE(v_image.value->>'alt', ''),
            COALESCE((v_image.value->>'position')::integer, 0)
          );
        END LOOP;
      END IF;
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
       p_organizer_contact IS NOT NULL OR p_attendance_points IS NOT NULL THEN
      
      UPDATE events
      SET
        start_datetime = COALESCE(p_start_datetime, start_datetime),
        end_datetime = COALESCE(p_end_datetime, end_datetime),
        venue_name = COALESCE(p_venue_name, venue_name),
        venue_address = COALESCE(p_venue_address, venue_address),
        google_maps_link = COALESCE(p_google_maps_link, google_maps_link),
        organizer_name = COALESCE(p_organizer_name, organizer_name),
        organizer_contact = COALESCE(p_organizer_contact, organizer_contact),
        attendance_points = COALESCE(p_attendance_points, attendance_points),
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
      'variants', COALESCE(
        (
          SELECT jsonb_agg(result)
          FROM (
            SELECT jsonb_build_object(
              'id', pv.id,
              'name', pv.name,
              'sku', pv.sku,
              'price', pv.price,
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
      'attendancePoints', e.attendance_points,
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

-- Update get_customer_events function
CREATE OR REPLACE FUNCTION get_customer_events(p_customer_id UUID, p_limit INT, p_offset INT)
RETURNS TABLE (
    event_id UUID,
    event_name TEXT,
    google_maps_link TEXT,
    organizer_contact TEXT,
    organizer_name TEXT,
    start_datetime TIMESTAMP,
    updated_at TIMESTAMP,
    venue_address TEXT,
    venue_name TEXT,
    image_url TEXT,
    attendance_points INTEGER,
    ticket_details JSON[],
    total_count BIGINT
) AS $$
DECLARE
    total_events BIGINT;
BEGIN
    -- First get the total count of unique events
    SELECT COUNT(DISTINCT (t.metadata->>'eventId')::UUID)
    INTO total_events
    FROM tickets t
    JOIN orders o ON t.order_id = o.id
    WHERE o.customer_id = p_customer_id
    AND t.metadata->>'eventId' IS NOT NULL;

    RETURN QUERY
    WITH unique_events AS (
        SELECT DISTINCT ON ((t.metadata->>'eventId')::UUID)
            (t.metadata->>'eventId')::UUID as event_id
        FROM tickets t
        JOIN orders o ON t.order_id = o.id
        WHERE o.customer_id = p_customer_id
        AND t.metadata->>'eventId' IS NOT NULL
        ORDER BY (t.metadata->>'eventId')::UUID, t.created_at DESC
    ),
    event_tickets AS (
        SELECT 
            ue.event_id as eid,
            array_agg(
                json_build_object(
                    'id', t.id,
                    'code', t.code,
                    'status', t.status,
                    'metadata', t.metadata,
                    'order_item_id', t.order_item_id
                )::json
                ORDER BY t.created_at DESC
            ) as tickets
        FROM unique_events ue
        JOIN tickets t ON (t.metadata->>'eventId')::UUID = ue.event_id
        JOIN orders o ON t.order_id = o.id
        WHERE o.customer_id = p_customer_id
        GROUP BY ue.event_id
    ),
    event_images AS (
        SELECT DISTINCT ON (p.id)
            p.id as product_id,
            pi.url as image_url
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        ORDER BY p.id, pi.position ASC NULLS LAST
    )
    SELECT DISTINCT ON (e.id)
        e.id,
        p.name,
        e.google_maps_link,
        e.organizer_contact,
        e.organizer_name,
        e.start_datetime::TIMESTAMP,
        e.updated_at::TIMESTAMP,
        e.venue_address,
        e.venue_name,
        ei.image_url,
        e.attendance_points,
        et.tickets,
        total_events
    FROM event_tickets et
    JOIN events e ON e.id = et.eid
    LEFT JOIN products p ON e.product_id = p.id
    LEFT JOIN event_images ei ON p.id = ei.product_id
    ORDER BY e.id, e.start_datetime DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_event TO authenticated;
GRANT EXECUTE ON FUNCTION update_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_events TO authenticated; 