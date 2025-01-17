/*
# Add Events Extension for Products

1. New Tables
- `events`
- Links to products table
- Adds event-specific fields like dates, venue, and organizer info

2. Changes
- Create events table with foreign key to products
- Add indexes for efficient querying
- Enable RLS with appropriate policies
 */
-- Create events table
CREATE TABLE
    IF NOT EXISTS events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
        product_id uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
        store_name text NOT NULL REFERENCES profiles (store_name) ON DELETE CASCADE,
        start_datetime timestamptz NOT NULL,
        end_datetime timestamptz NOT NULL,
        venue_name text NOT NULL,
        venue_address text NOT NULL,
        google_maps_link text,
        organizer_name text NOT NULL,
        organizer_contact text NOT NULL,
        created_at timestamptz DEFAULT now (),
        updated_at timestamptz DEFAULT now (),
        CONSTRAINT events_dates_check CHECK (end_datetime > start_datetime)
    );

-- Create indexes
CREATE INDEX events_product_id_idx ON events (product_id);

CREATE INDEX events_store_name_idx ON events (store_name);

CREATE INDEX events_start_datetime_idx ON events (start_datetime);

CREATE INDEX events_end_datetime_idx ON events (end_datetime);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their store's events" ON events FOR ALL USING (
    EXISTS (
        SELECT
            1
        FROM
            profiles
        WHERE
            profiles.store_name = events.store_name
            AND profiles.id = auth.uid ()
    )
);

CREATE POLICY "Public users can view events" ON events FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                products
            WHERE
                products.id = events.product_id
                AND products.status = 'active'
        )
    );

-- Grant permissions
GRANT ALL ON TABLE events TO authenticated;

GRANT
SELECT
    ON TABLE events TO anon;

-- Add helpful comments
COMMENT ON TABLE events IS 'Stores event-specific details for products that are events';

COMMENT ON COLUMN events.product_id IS 'References the base product this event extends';

COMMENT ON COLUMN events.start_datetime IS 'When the event starts';

COMMENT ON COLUMN events.end_datetime IS 'When the event ends';

COMMENT ON COLUMN events.venue_name IS 'Name of the event venue';

COMMENT ON COLUMN events.venue_address IS 'Physical address of the event venue';

COMMENT ON COLUMN events.google_maps_link IS 'Optional Google Maps link to the venue';

COMMENT ON COLUMN events.organizer_name IS 'Name of the event organizer';

COMMENT ON COLUMN events.organizer_contact IS 'Contact information for the event organizer';