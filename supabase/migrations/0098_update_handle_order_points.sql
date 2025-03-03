-- update order points trigger
CREATE OR REPLACE FUNCTION handle_order_points() 
RETURNS TRIGGER AS $$
DECLARE
  v_campaign record;
  v_points numeric;
BEGIN
  -- Only proceed if status changed to 'processing'
  IF NEW.status = 'processing' AND OLD.status != 'processing' THEN
    -- Check each active campaign
    FOR v_campaign IN 
      SELECT * FROM campaigns 
      WHERE status = 'active' 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      AND type NOT IN ('scan_to_get_points', 'click_link_to_get_points')
      AND store_name = NEW.store_name
    LOOP
      -- Check if order qualifies for campaign
      IF check_campaign_conditions(v_campaign.id, NEW.id) THEN
        -- Calculate points
        v_points := calculate_campaign_points(v_campaign.id, NEW.id);
        
        -- Record points transaction
        INSERT INTO points_transactions (
          store_name,
          customer_id,
          order_id,
          campaign_id,
          points,
          type,
          description
        ) VALUES (
          NEW.store_name,
          NEW.customer_id,
          NEW.id,
          v_campaign.id,
          v_points,
          'earn',
          'Points earned from order #' || NEW.id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;