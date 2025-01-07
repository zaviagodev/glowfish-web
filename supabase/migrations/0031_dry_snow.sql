-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  multiplier numeric,
  bonus_points integer,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  target_type text NOT NULL,
  target_tiers uuid[],
  target_groups uuid[],
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT campaigns_type_check CHECK (type IN ('points_multiplier', 'bonus_points')),
  CONSTRAINT campaigns_target_type_check CHECK (target_type IN ('all', 'tier', 'group')),
  CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'scheduled', 'active', 'ended')),
  CONSTRAINT campaigns_dates_check CHECK (end_date > start_date),
  CONSTRAINT campaigns_multiplier_check CHECK (
    (type = 'points_multiplier' AND multiplier IS NOT NULL AND multiplier > 0) OR
    (type = 'bonus_points' AND bonus_points IS NOT NULL AND bonus_points > 0)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS campaigns_store_name_idx ON campaigns(store_name);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_dates_idx ON campaigns(start_date, end_date);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their store's campaigns"
  ON campaigns
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = campaigns.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = campaigns.store_name
      AND profiles.id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON TABLE campaigns TO authenticated;
GRANT SELECT ON TABLE campaigns TO anon;

-- Add helpful comments
COMMENT ON TABLE campaigns IS 'Stores points and rewards campaigns';
COMMENT ON COLUMN campaigns.type IS 'Type of campaign: points multiplier or bonus points';
COMMENT ON COLUMN campaigns.target_type IS 'Campaign target: all customers, specific tiers, or specific groups';
COMMENT ON COLUMN campaigns.status IS 'Campaign status: draft, scheduled, active, or ended';