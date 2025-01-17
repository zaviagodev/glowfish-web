/*
  # Store Settings Schema

  1. New Tables
    - `store_settings`
      - `store_name` (text, primary key, references profiles)
      - `currency` (text)
      - `weight_unit` (text)
      - `dimension_unit` (text)
      - `order_prefix` (text)
      - `guest_checkout` (boolean)
      - `require_phone` (boolean)
      - `require_shipping` (boolean)
      - `require_billing` (boolean)
      - `track_inventory` (boolean)
      - `low_stock_threshold` (integer)
      - `out_of_stock_behavior` (text)
      - `tax_calculation` (text)
      - `tax_inclusive` (boolean)
      - `default_tax_rate` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for store owners
*/

-- Create store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  store_name text PRIMARY KEY REFERENCES profiles(store_name) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USD',
  weight_unit text NOT NULL DEFAULT 'kg',
  dimension_unit text NOT NULL DEFAULT 'cm',
  order_prefix text NOT NULL DEFAULT '#',
  guest_checkout boolean NOT NULL DEFAULT true,
  require_phone boolean NOT NULL DEFAULT false,
  require_shipping boolean NOT NULL DEFAULT true,
  require_billing boolean NOT NULL DEFAULT true,
  track_inventory boolean NOT NULL DEFAULT true,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  out_of_stock_behavior text NOT NULL DEFAULT 'hide',
  tax_calculation text NOT NULL DEFAULT 'line_items',
  tax_inclusive boolean NOT NULL DEFAULT false,
  default_tax_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT store_settings_currency_check CHECK (currency IN ('USD', 'EUR', 'GBP')),
  CONSTRAINT store_settings_weight_unit_check CHECK (weight_unit IN ('kg', 'lb')),
  CONSTRAINT store_settings_dimension_unit_check CHECK (dimension_unit IN ('cm', 'in')),
  CONSTRAINT store_settings_out_of_stock_check CHECK (out_of_stock_behavior IN ('hide', 'show', 'backorder')),
  CONSTRAINT store_settings_tax_calculation_check CHECK (tax_calculation IN ('line_items', 'total')),
  CONSTRAINT store_settings_tax_rate_check CHECK (default_tax_rate >= 0 AND default_tax_rate <= 100)
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their store's settings"
  ON store_settings
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = store_settings.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = store_settings.store_name
      AND profiles.id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON TABLE store_settings TO authenticated;
GRANT SELECT ON TABLE store_settings TO anon;

-- Add helpful comments
COMMENT ON TABLE store_settings IS 'Stores e-commerce settings for each store';
COMMENT ON COLUMN store_settings.out_of_stock_behavior IS 'How to handle out of stock products: hide, show, or allow backorders';
COMMENT ON COLUMN store_settings.tax_calculation IS 'How taxes are calculated: per line item or on order total';