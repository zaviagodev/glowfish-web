/*
  # Customer Groups Schema

  1. New Tables
    - `customer_groups`
      - `id` (uuid, primary key)
      - `store_name` (text, references profiles)
      - `name` (text)
      - `description` (text)
      - `color` (text)
      - `auto_assign` (boolean)
      - `conditions` (jsonb)
      - `members` (text[])
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `customer_groups` table
    - Add policies for authenticated users to manage their store's groups
    - Add policy for public read access

  3. Changes
    - Add indexes for efficient querying
    - Add constraints for data validation
*/

-- Create customer groups table
CREATE TABLE IF NOT EXISTS customer_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL,
  auto_assign boolean NOT NULL DEFAULT false,
  conditions jsonb DEFAULT '[]'::jsonb,
  members text[] DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT customer_groups_status_check CHECK (status IN ('active', 'inactive'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS customer_groups_store_name_idx ON customer_groups(store_name);
CREATE INDEX IF NOT EXISTS customer_groups_auto_assign_idx ON customer_groups(auto_assign) WHERE auto_assign = true;

-- Enable RLS
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their store's groups"
  ON customer_groups
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = customer_groups.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = customer_groups.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Public users can view groups"
  ON customer_groups
  FOR SELECT
  USING (true);

-- Grant permissions
GRANT ALL ON TABLE customer_groups TO authenticated;
GRANT SELECT ON TABLE customer_groups TO anon;