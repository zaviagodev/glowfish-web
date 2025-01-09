-- Create function to handle campaign redemptions
CREATE OR REPLACE FUNCTION redeem_campaign(
  p_campaign_id uuid,
  p_customer_id uuid,
  p_store_name text
) RETURNS TABLE(redemption_id uuid, points_earned numeric) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign record;
  v_customer record;
  v_points numeric;
  v_redemption_id uuid;
  v_redemption_count integer;
BEGIN
  -- Get campaign details
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id
  AND store_name = p_store_name
  AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found or not active';
  END IF;

  -- Get customer details
  SELECT * INTO v_customer
  FROM customers
  WHERE id = p_customer_id
  AND store_name = p_store_name
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  -- Check redemption limits
  SELECT COUNT(*) INTO v_redemption_count
  FROM campaign_redemptions
  WHERE campaign_id = p_campaign_id
  AND customer_id = p_customer_id;

  -- Check QR code scan limit
  IF v_campaign.qr_enabled AND v_campaign.qr_scan_limit IS NOT NULL THEN
    IF v_redemption_count >= v_campaign.qr_scan_limit THEN
      RAISE EXCEPTION 'QR code scan limit reached';
    END IF;
  END IF;

  -- Check click link limit
  IF v_campaign.click_link_enabled AND v_campaign.click_link_limit IS NOT NULL THEN
    IF v_redemption_count >= v_campaign.click_link_limit THEN
      RAISE EXCEPTION 'Click link limit reached';
    END IF;
  END IF;

  -- Calculate points
  IF v_campaign.type = 'points_multiplier' THEN
    v_points := v_campaign.multiplier;
  ELSE
    v_points := v_campaign.bonus_points;
  END IF;

  -- Create redemption record
  INSERT INTO campaign_redemptions (
    campaign_id,
    customer_id,
    store_name,
    points_earned
  ) VALUES (
    p_campaign_id,
    p_customer_id,
    p_store_name,
    v_points
  ) RETURNING id INTO v_redemption_id;

  -- Return redemption details
  RETURN QUERY
  SELECT v_redemption_id, v_points;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION redeem_campaign TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_campaign TO anon;

-- Add helpful comment
COMMENT ON FUNCTION redeem_campaign IS 'Handles campaign redemption and points calculation';