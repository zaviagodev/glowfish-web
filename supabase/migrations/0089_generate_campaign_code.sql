-- Create campaign_codes table
CREATE TABLE IF NOT EXISTS campaign_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  redemption_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX campaign_codes_code_idx ON campaign_codes(code);
CREATE INDEX campaign_codes_campaign_idx ON campaign_codes(campaign_id);

-- Enable RLS
ALTER TABLE campaign_codes ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated store owners to manage their store's campaign codes
CREATE POLICY "Users can manage their store's campaign codes"
  ON campaign_codes
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN profiles p ON p.store_name = c.store_name
      WHERE c.id = campaign_codes.campaign_id
      AND p.id = auth.uid()
    )
  );

-- Create generate_campaign_code function
CREATE OR REPLACE FUNCTION generate_campaign_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate code for scan or click campaigns
    IF NEW.type IN ('scan_to_get_points', 'click_link_to_get_points') THEN
        -- Insert new code into campaign_codes
        INSERT INTO campaign_codes (campaign_id, code)
        VALUES (NEW.id, generate_ticket_code());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS campaign_code_generator ON campaigns;
CREATE TRIGGER campaign_code_generator
    AFTER INSERT ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION generate_campaign_code();

-- Function to validate and redeem campaign code
CREATE OR REPLACE FUNCTION redeem_campaign_code(
  p_code text
) RETURNS TABLE(points_earned numeric) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign_id uuid;
  v_campaign_type text;
  v_campaign_config jsonb;
  v_campaign_status text;
  v_customer_id uuid;
  v_points numeric;
  v_customer_redemption_count integer;
  v_store_name text;
  v_code_id uuid;
  v_code_redemption_count integer;
BEGIN
  -- Get campaign details by code
  SELECT 
    cc.id,
    cc.redemption_count,
    c.id,
    c.type,
    c.config,
    c.status,
    p.store_name 
  INTO 
    v_code_id,
    v_code_redemption_count,
    v_campaign_id,
    v_campaign_type,
    v_campaign_config,
    v_campaign_status,
    v_store_name
  FROM campaign_codes cc
  JOIN campaigns c ON c.id = cc.campaign_id
  JOIN profiles p ON p.store_name = c.store_name
  WHERE cc.code = p_code
  AND c.status = 'active'
  AND c.start_date <= NOW()
  AND c.end_date >= NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found or not active';
  END IF;

  -- Get customer details using auth.uid()
  SELECT id INTO v_customer_id
  FROM customers
  WHERE auth_id = v_campaign_id
  AND store_name = v_store_name
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  -- Check total supply limit if configured
  IF (v_campaign_config ? 'supply') AND (v_campaign_config->>'supply')::integer > 0 THEN
    IF v_code_redemption_count >= (v_campaign_config->>'supply')::integer THEN
      RAISE EXCEPTION 'Campaign code supply exhausted';
    END IF;
  END IF;

  -- Check customer's personal redemption limit
  -- Count how many times this customer has used this campaign
  SELECT COUNT(*) INTO v_customer_redemption_count
  FROM points_transactions
  WHERE campaign_id = v_campaign_id
  AND customer_id = v_customer_id
  AND type = 'earn';

  -- If maxClaims is not specified, default to 1
  -- If specified, use the configured value
  IF v_customer_redemption_count >= COALESCE((v_campaign_config->>'maxClaims')::integer, 1) THEN
    RAISE EXCEPTION 'Maximum claims reached for this campaign';
  END IF;

  -- Get points based on campaign type
  IF v_campaign_type IN ('scan_to_get_points', 'click_link_to_get_points') THEN
    v_points := (v_campaign_config->>'points')::numeric;
  ELSE
    RAISE EXCEPTION 'Invalid campaign type for code redemption';
  END IF;

  -- Create points transaction
  INSERT INTO points_transactions (
    store_name,
    customer_id,
    campaign_id,
    points,
    type,
    description
  ) VALUES (
    v_store_name,
    v_customer_id,
    v_campaign_id,
    v_points,
    'earn',
    'Points earned from campaign code: ' || p_code
  );

  -- Update redemption_count counter
  UPDATE campaign_codes 
  SET 
    redemption_count = redemption_count + 1,
    updated_at = NOW()
  WHERE code = p_code;

  -- Return points earned
  RETURN QUERY SELECT v_points;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION redeem_campaign_code TO authenticated;

-- Add helpful comments
COMMENT ON TABLE campaign_codes IS 'Stores campaign codes and their usage statistics';
COMMENT ON FUNCTION redeem_campaign_code IS 'Validates and redeems a campaign code, creating a points transaction if successful';
COMMENT ON FUNCTION generate_campaign_code IS 'Generates a unique code for scan or click campaigns';