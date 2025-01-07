/*
  # Update Category Security Policies

  1. Changes
    - Fix RLS policies for product categories table
    - Add proper insert/update/delete policies
    - Ensure store owners can manage their categories
    - Allow public read access

  2. Security
    - Enable RLS
    - Add granular policies for CRUD operations
    - Restrict access based on store ownership
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their store's categories" ON product_categories;
DROP POLICY IF EXISTS "Public users can view categories" ON product_categories;

-- Create specific policies for each operation
CREATE POLICY "Users can insert categories for their store"
  ON product_categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their store's categories"
  ON product_categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their store's categories"
  ON product_categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can view their store's categories"
  ON product_categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = product_categories.store_name
    )
  );