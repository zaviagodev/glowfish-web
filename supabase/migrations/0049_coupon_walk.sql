-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  code text NOT NULL,
  description text,
  type text NOT NULL,
  value numeric NOT NULL,
  min_purchase_amount numeric,
  max_discount_amount numeric,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  advanced_mode boolean DEFAULT false,
  conditions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT coupons_type_check CHECK (type IN ('percentage', 'fixed', 'shipping', 'points')),
  CONSTRAINT coupons_status_check CHECK (status IN ('draft', 'scheduled', 'active', 'expired')),
  CONSTRAINT coupons_dates_check CHECK (end_date > start_date),
  CONSTRAINT coupons_value_check CHECK (value >= 0),
  CONSTRAINT coupons_min_purchase_check CHECK (min_purchase_amount IS NULL OR min_purchase_amount >= 0),
  CONSTRAINT coupons_max_discount_check CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0),
  CONSTRAINT coupons_usage_limit_check CHECK (usage_limit IS NULL OR usage_limit > 0),
  CONSTRAINT coupons_usage_count_check CHECK (usage_count >= 0),
  UNIQUE(store_name, code)
);

-- Create indexes
CREATE INDEX coupons_store_name_idx ON coupons(store_name);
CREATE INDEX coupons_code_idx ON coupons(code);
CREATE INDEX coupons_status_idx ON coupons(status);
CREATE INDEX coupons_dates_idx ON coupons(start_date, end_date);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their store's coupons"
  ON coupons
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = coupons.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = coupons.store_name
      AND profiles.id = auth.uid()
    )
  );

-- Create policy for public access by code only
CREATE POLICY "Public users can view active coupons by code"
  ON coupons
  FOR SELECT
  USING (
    status = 'active' AND
    start_date <= CURRENT_TIMESTAMP AND
    end_date > CURRENT_TIMESTAMP AND
    (usage_limit IS NULL OR usage_count < usage_limit)
  );

-- Grant permissions
GRANT ALL ON TABLE coupons TO authenticated;
GRANT SELECT ON TABLE coupons TO anon;

-- Add helpful comments
COMMENT ON TABLE coupons IS 'Stores coupon campaigns';
COMMENT ON COLUMN coupons.type IS 'Type of discount: percentage, fixed amount, free shipping, or points';
COMMENT ON COLUMN coupons.conditions IS 'Advanced conditions for coupon eligibility';