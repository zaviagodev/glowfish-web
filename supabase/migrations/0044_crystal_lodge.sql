-- Add missing columns to campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS qr_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS qr_point_type text,
  ADD COLUMN IF NOT EXISTS qr_point_value numeric,
  ADD COLUMN IF NOT EXISTS qr_scan_limit integer,
  ADD COLUMN IF NOT EXISTS qr_total_scans integer,
  ADD COLUMN IF NOT EXISTS click_link_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS click_link_limit integer,
  ADD COLUMN IF NOT EXISTS has_product_rules boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_conditions boolean DEFAULT false;

-- Add constraints
ALTER TABLE campaigns
  ADD CONSTRAINT campaigns_qr_point_type_check 
    CHECK (qr_point_type IN ('fixed', 'multiplier')),
  ADD CONSTRAINT campaigns_qr_point_value_check 
    CHECK (qr_point_value IS NULL OR qr_point_value > 0),
  ADD CONSTRAINT campaigns_qr_scan_limit_check 
    CHECK (qr_scan_limit IS NULL OR qr_scan_limit > 0),
  ADD CONSTRAINT campaigns_qr_total_scans_check 
    CHECK (qr_total_scans IS NULL OR qr_total_scans > 0),
  ADD CONSTRAINT campaigns_click_link_limit_check 
    CHECK (click_link_limit IS NULL OR click_link_limit > 0);

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS campaigns_qr_enabled_idx 
  ON campaigns(qr_enabled) 
  WHERE qr_enabled = true;

CREATE INDEX IF NOT EXISTS campaigns_click_link_enabled_idx 
  ON campaigns(click_link_enabled) 
  WHERE click_link_enabled = true;

-- Add helpful comments
COMMENT ON COLUMN campaigns.qr_enabled IS 'Indicates if QR code scanning is enabled for this campaign';
COMMENT ON COLUMN campaigns.qr_point_type IS 'Type of points awarded for QR scans: fixed or multiplier';
COMMENT ON COLUMN campaigns.click_link_enabled IS 'Indicates if click-through link rewards are enabled';