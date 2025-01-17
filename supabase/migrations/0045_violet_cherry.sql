-- Create campaign conditions table
CREATE TABLE IF NOT EXISTS campaign_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  type text NOT NULL,
  operator text NOT NULL,
  value text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT campaign_conditions_type_check CHECK (
    type IN ('total_spent', 'order_count', 'last_order', 'location')
  ),
  CONSTRAINT campaign_conditions_operator_check CHECK (
    operator IN ('greater_than', 'less_than', 'equal_to')
  )
);

-- Create campaign product rules table
CREATE TABLE IF NOT EXISTS campaign_product_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  type text NOT NULL,
  operator text NOT NULL,
  value text NOT NULL,
  enabled boolean DEFAULT true,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES product_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT campaign_product_rules_type_check CHECK (
    type IN ('product_purchased', 'product_quantity', 'product_amount', 'category_purchased', 'category_quantity', 'category_amount')
  ),
  CONSTRAINT campaign_product_rules_operator_check CHECK (
    operator IN ('greater_than', 'less_than', 'equal_to')
  ),
  CONSTRAINT campaign_product_rules_reference_check CHECK (
    (product_id IS NOT NULL AND category_id IS NULL) OR
    (product_id IS NULL AND category_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS campaign_conditions_campaign_idx ON campaign_conditions(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_conditions_store_idx ON campaign_conditions(store_name);
CREATE INDEX IF NOT EXISTS campaign_product_rules_campaign_idx ON campaign_product_rules(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_product_rules_store_idx ON campaign_product_rules(store_name);
CREATE INDEX IF NOT EXISTS campaign_product_rules_product_idx ON campaign_product_rules(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS campaign_product_rules_category_idx ON campaign_product_rules(category_id) WHERE category_id IS NOT NULL;

-- Enable RLS
ALTER TABLE campaign_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_product_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign conditions
CREATE POLICY "Users can manage their store's campaign conditions"
  ON campaign_conditions
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = campaign_conditions.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = campaign_conditions.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Public users can view campaign conditions"
  ON campaign_conditions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_conditions.campaign_id
      AND campaigns.status IN ('active', 'scheduled')
    )
  );

-- Create policies for campaign product rules
CREATE POLICY "Users can manage their store's campaign product rules"
  ON campaign_product_rules
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = campaign_product_rules.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = campaign_product_rules.store_name
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Public users can view campaign product rules"
  ON campaign_product_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_product_rules.campaign_id
      AND campaigns.status IN ('active', 'scheduled')
    )
  );

-- Grant permissions
GRANT ALL ON TABLE campaign_conditions TO authenticated;
GRANT SELECT ON TABLE campaign_conditions TO anon;
GRANT ALL ON TABLE campaign_product_rules TO authenticated;
GRANT SELECT ON TABLE campaign_product_rules TO anon;

-- Add helpful comments
COMMENT ON TABLE campaign_conditions IS 'Stores conditions for campaign eligibility';
COMMENT ON TABLE campaign_product_rules IS 'Stores product-specific rules for campaigns';