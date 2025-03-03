-- # Add Stores Table and Modify Profiles
-- 1. Changes
-- - Create new stores table
-- - Rename store_name to default_store_name in profiles table
-- - Update foreign key references

-- Create stores table
CREATE TABLE
    IF NOT EXISTS stores (
        name text PRIMARY KEY,
        created_at timestamptz DEFAULT now (),
        updated_at timestamptz DEFAULT now ()
    );

-- Rename store_name to default_store_name in profiles
ALTER TABLE profiles
RENAME COLUMN store_name TO default_store_name;

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert stores" ON stores FOR INSERT
WITH
    CHECK (auth.role () = 'authenticated');

-- Migrate existing store names to stores table
INSERT INTO
    stores (name)
SELECT DISTINCT
    default_store_name
FROM
    profiles ON CONFLICT DO NOTHING;

-- Now add the foreign key constraint after populating stores
ALTER TABLE profiles
ADD CONSTRAINT profiles_default_store_name_fkey FOREIGN KEY (default_store_name) REFERENCES stores (name) ON DELETE CASCADE;

-- Update foreign key references in other tables to point to stores
ALTER TABLE campaigns
DROP CONSTRAINT campaigns_store_name_fkey,
ADD CONSTRAINT campaigns_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE customer_groups
DROP CONSTRAINT customer_groups_store_name_fkey,
ADD CONSTRAINT customer_groups_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE customer_tiers
DROP CONSTRAINT customer_tiers_store_name_fkey,
ADD CONSTRAINT customer_tiers_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE customers
DROP CONSTRAINT customers_store_name_fkey,
ADD CONSTRAINT customers_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE customer_addresses
DROP CONSTRAINT customer_addresses_store_name_fkey,
ADD CONSTRAINT customer_addresses_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE events
DROP CONSTRAINT events_store_name_fkey,
ADD CONSTRAINT events_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE payment_settings
DROP CONSTRAINT payment_settings_store_name_fkey,
ADD CONSTRAINT payment_settings_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE points_transactions
DROP CONSTRAINT points_transactions_store_name_fkey,
ADD CONSTRAINT points_transactions_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE product_categories
DROP CONSTRAINT product_categories_store_name_fkey,
ADD CONSTRAINT product_categories_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE product_tags
DROP CONSTRAINT product_tags_store_name_fkey,
ADD CONSTRAINT product_tags_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE products
DROP CONSTRAINT products_store_name_fkey,
ADD CONSTRAINT products_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE orders
DROP CONSTRAINT orders_store_name_fkey,
ADD CONSTRAINT orders_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE coupons
DROP CONSTRAINT coupons_store_name_fkey,
ADD CONSTRAINT coupons_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE campaign_redemptions
DROP CONSTRAINT campaign_redemptions_store_name_fkey,
ADD CONSTRAINT campaign_redemptions_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

ALTER TABLE store_settings
DROP CONSTRAINT store_settings_store_name_fkey,
ADD CONSTRAINT store_settings_store_name_fkey FOREIGN KEY (store_name) REFERENCES stores (name) ON DELETE CASCADE;

-- Add helpful comments
COMMENT ON TABLE stores IS 'Stores basic information about stores';

COMMENT ON COLUMN stores.name IS 'Unique identifier for the store';

CREATE OR REPLACE FUNCTION create_payment_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_settings (store_name)
  VALUES (NEW.default_store_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_store_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO store_settings (store_name)
  VALUES (NEW.default_store_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;