/*
  # Create product categories table

  1. New Tables
    - `product_categories`
      - `id` (uuid, primary key)
      - `store_name` (text, foreign key)
      - `name` (text)
      - `slug` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `product_categories` table
    - Add policies for store owners to manage their categories
    - Add policies for public users to view active categories

  3. Indexes
    - Index on store_name for faster lookups
    - Unique index on store_name + slug combination
*/

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_name, slug)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS product_categories_store_name_idx ON product_categories(store_name);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Policies for store owners
CREATE POLICY "Users can manage their store's categories"
  ON product_categories
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
      AND profiles.id = auth.uid()
    )
  );

-- Policy for public access
CREATE POLICY "Public users can view categories"
  ON product_categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
    )
  );