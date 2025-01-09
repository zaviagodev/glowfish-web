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
  qr_enabled boolean DEFAULT false,
  qr_point_type text,
  qr_point_value numeric,
  qr_scan_limit integer,
  qr_total_scans integer,
  click_link_enabled boolean DEFAULT false,
  click_link_limit integer,
  has_product_rules boolean DEFAULT false,
  has_conditions boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT campaigns_type_check CHECK (type IN ('points_multiplier', 'bonus_points')),
  CONSTRAINT campaigns_target_type_check CHECK (target_type IN ('all', 'tier', 'group')),
  CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'scheduled', 'active', 'ended')),
  CONSTRAINT campaigns_dates_check CHECK (end_date > start_date),
  CONSTRAINT campaigns_qr_point_type_check CHECK (qr_point_type IN ('fixed', 'multiplier')),
  CONSTRAINT campaigns_multiplier_check CHECK (
    (type = 'points_multiplier' AND multiplier IS NOT NULL AND multiplier > 0) OR
    (type = 'bonus_points' AND bonus_points IS NOT NULL AND bonus_points > 0)
  )
);

-- Create campaign redemptions table
CREATE TABLE IF NOT EXISTS campaign_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  points_earned numeric NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  CONSTRAINT campaign_redemptions_points_check CHECK (points_earned >= 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS campaigns_store_name_idx ON campaigns(store_name);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_dates_idx ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS campaign_redemptions_campaign_idx ON campaign_redemptions(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_redemptions_customer_idx ON campaign_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS campaign_redemptions_store_idx ON campaign_redemptions(store_name);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_redemptions ENABLE ROW LEVEL SECURITY;

-- Create or update policies for campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'campaigns'
      AND policyname = 'Users can manage their store''s campaigns'
  ) THEN
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
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'campaigns'
      AND policyname = 'Public users can view active campaigns'
  ) THEN
    CREATE POLICY "Public users can view active campaigns"
    ON campaigns
    FOR SELECT
    USING (
      status IN ('active', 'scheduled') AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.store_name = campaigns.store_name
      )
    );
  END IF;
END $$;

-- Create or update policies for campaign redemptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'campaign_redemptions'
      AND policyname = 'Users can manage their store''s redemptions'
  ) THEN
    CREATE POLICY "Users can manage their store's redemptions"
    ON campaign_redemptions
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.store_name = campaign_redemptions.store_name
        AND profiles.id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.store_name = campaign_redemptions.store_name
        AND profiles.id = auth.uid()
      )
    );
  END IF;
END $$;

-- Grant permissions
GRANT ALL ON TABLE campaigns TO authenticated;
GRANT SELECT ON TABLE campaigns TO anon;
GRANT ALL ON TABLE campaign_redemptions TO authenticated;
GRANT SELECT ON TABLE campaign_redemptions TO anon;

-- Add helpful comments
COMMENT ON TABLE campaigns IS 'Stores points and rewards campaigns';
COMMENT ON TABLE campaign_redemptions IS 'Tracks campaign redemptions by customers';