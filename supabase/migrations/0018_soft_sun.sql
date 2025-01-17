/*
  # Customer Tiers Schema

  1. New Tables
    - `customer_tiers`
      - `id` (uuid, primary key)
      - `store_name` (text, references profiles)
      - `name` (text)
      - `description` (text)
      - `color` (text)
      - `requirements` (jsonb)
      - `rewards_multiplier` (numeric)
      - `discount_percentage` (numeric)
      - `free_shipping` (boolean)
      - `priority_support` (boolean)
      - `early_access` (boolean)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for store owners
*/

-- Create customer tiers table
CREATE TABLE IF NOT EXISTS customer_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL,
  requirements jsonb DEFAULT '[]'::jsonb,
  rewards_multiplier numeric NOT NULL DEFAULT 1,
  discount_percentage numeric NOT NULL DEFAULT 0,
  free_shipping boolean NOT NULL DEFAULT false,
  priority_support boolean NOT NULL DEFAULT false,
  early_access boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT customer_tiers_status_check CHECK (status IN ('active', 'inactive')),
  CONSTRAINT customer_tiers_rewards_multiplier_check CHECK (rewards_multiplier >= 1),
  CONSTRAINT customer_tiers_discount_percentage_check CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS customer_tiers_store_name_idx ON customer_tiers(store_name);

-- Enable RLS
ALTER TABLE customer_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their store's tiers"
  ON customer_tiers
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = customer_tiers.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = customer_tiers.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Public users can view tiers"
  ON customer_tiers
  FOR SELECT
  USING (true);

-- Grant permissions
GRANT ALL ON TABLE customer_tiers TO authenticated;
GRANT SELECT ON TABLE customer_tiers TO anon;