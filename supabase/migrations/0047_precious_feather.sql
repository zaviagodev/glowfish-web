-- Create points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text REFERENCES profiles(store_name) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  points numeric NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT points_transactions_type_check CHECK (type IN ('earn', 'redeem', 'expire', 'adjust'))
);

-- Create indexes
CREATE INDEX points_transactions_customer_idx ON points_transactions(customer_id);
CREATE INDEX points_transactions_order_idx ON points_transactions(order_id);
CREATE INDEX points_transactions_campaign_idx ON points_transactions(campaign_id);
CREATE INDEX points_transactions_store_idx ON points_transactions(store_name);

-- Enable RLS
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function for category amount check
CREATE OR REPLACE FUNCTION check_category_amount_condition(
  p_order_id uuid,
  p_product_id uuid,
  operator text DEFAULT 'equal_to',
  expected_amount numeric DEFAULT 0 -- Added default value
) RETURNS boolean AS $$
DECLARE
  v_category_amount numeric;
  v_category text;
BEGIN
  -- First get the category from the reference product
  SELECT p.category_id INTO v_category
  FROM products p
  WHERE p.id = p_product_id;

  -- Then sum amounts for all products in that category
  SELECT COALESCE(SUM(oi.quantity * oi.price), 0) INTO v_category_amount
  FROM order_items oi
  JOIN product_variants pv ON pv.id = oi.variant_id
  JOIN products p ON p.id = pv.product_id
  WHERE oi.order_id = p_order_id
  AND p.category_id = v_category;

  RETURN CASE operator
    WHEN 'greater_than' THEN v_category_amount > expected_amount
    WHEN 'less_than' THEN v_category_amount < expected_amount
    WHEN 'equal_to' THEN v_category_amount = expected_amount
    ELSE FALSE -- Invalid operator
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function for category quantity check
CREATE OR REPLACE FUNCTION check_category_quantity_condition(
  p_order_id uuid,
  p_product_id uuid,
  operator text DEFAULT 'equal_to',
  expected_quantity integer DEFAULT 0 -- Added default value
) RETURNS boolean AS $$
DECLARE
  v_category_quantity integer;
  v_category text;
BEGIN
  -- First get the category from the reference product
  SELECT p.category_id INTO v_category
  FROM products p
  WHERE p.id = p_product_id;

  -- Then sum quantities for all products in that category
  SELECT COALESCE(SUM(oi.quantity), 0) INTO v_category_quantity
  FROM order_items oi
  JOIN product_variants pv ON pv.id = oi.variant_id
  JOIN products p ON p.id = pv.product_id
  WHERE oi.order_id = p_order_id
  AND p.category_id = v_category;

  RETURN CASE operator
    WHEN 'greater_than' THEN v_category_quantity > expected_quantity
    WHEN 'less_than' THEN v_category_quantity < expected_quantity
    WHEN 'equal_to' THEN v_category_quantity = expected_quantity
    ELSE FALSE -- Invalid operator
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function for category purchased check
CREATE OR REPLACE FUNCTION check_category_purchased_condition(
  p_order_id uuid,
  p_product_id uuid,
  expected_category text
) RETURNS boolean AS $$
DECLARE
  v_product_category text;
BEGIN
  SELECT p.category_id INTO v_product_category
  FROM order_items oi
  JOIN product_variants pv ON pv.id = oi.variant_id
  JOIN products p ON p.id = pv.product_id
  WHERE oi.order_id = p_order_id
  AND p.id = p_product_id
  LIMIT 1;

  RETURN v_product_category::text = expected_category;
END;
$$ LANGUAGE plpgsql;

-- Helper function for product quantity check
CREATE OR REPLACE FUNCTION check_product_quantity_condition(
  p_order_id uuid,
  p_product_id uuid,
  operator text DEFAULT 'equal_to',
  expected_quantity integer DEFAULT 0 -- Added default value
) RETURNS boolean AS $$
DECLARE
  v_product_quantity integer;
BEGIN
  SELECT COALESCE(SUM(oi.quantity), 0) INTO v_product_quantity
  FROM order_items oi
  JOIN product_variants pv ON pv.id = oi.variant_id
  WHERE oi.order_id = p_order_id
  AND pv.product_id = p_product_id;

  RETURN CASE operator
    WHEN 'greater_than' THEN v_product_quantity > expected_quantity
    WHEN 'less_than' THEN v_product_quantity < expected_quantity
    WHEN 'equal_to' THEN v_product_quantity = expected_quantity
    ELSE FALSE -- Invalid operator
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function for product purchased check
CREATE OR REPLACE FUNCTION check_product_purchased_condition(
  p_order_id uuid,
  p_product_id uuid
) RETURNS boolean AS $$
DECLARE
  v_product_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.variant_id
    WHERE oi.order_id = p_order_id
    AND pv.product_id = p_product_id
  ) INTO v_product_exists;

  RETURN v_product_exists;
END;
$$ LANGUAGE plpgsql;

-- Add new helper functions for customer-related conditions
CREATE OR REPLACE FUNCTION check_lifetime_value_condition(
  p_customer_id uuid,
  operator text,
  expected_value numeric
) RETURNS boolean AS $$
DECLARE
  v_lifetime_value numeric;
BEGIN
  SELECT COALESCE(SUM(total), 0) INTO v_lifetime_value
  FROM orders
  WHERE customer_id = p_customer_id
  AND status = 'completed';

  RETURN CASE operator
    WHEN 'greater_than' THEN v_lifetime_value > expected_value
    WHEN 'less_than' THEN v_lifetime_value < expected_value
    WHEN 'equal_to' THEN v_lifetime_value = expected_value
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_account_age_condition(
  p_customer_id uuid,
  operator text,
  expected_days integer
) RETURNS boolean AS $$
DECLARE
  v_account_age integer;
BEGIN
  SELECT EXTRACT(DAY FROM NOW() - created_at)::integer INTO v_account_age
  FROM customers
  WHERE id = p_customer_id;

  RETURN CASE operator
    WHEN 'greater_than' THEN v_account_age > expected_days
    WHEN 'less_than' THEN v_account_age < expected_days
    WHEN 'equal_to' THEN v_account_age = expected_days
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

-- Add more helper functions for order-related conditions
CREATE OR REPLACE FUNCTION check_order_count_condition(
  p_customer_id uuid,
  operator text,
  expected_count integer
) RETURNS boolean AS $$
DECLARE
  v_order_count integer;
BEGIN
  SELECT COUNT(*) INTO v_order_count
  FROM orders
  WHERE customer_id = p_customer_id
  AND status = 'completed';

  RETURN CASE operator
    WHEN 'greater_than' THEN v_order_count > expected_count
    WHEN 'less_than' THEN v_order_count < expected_count
    WHEN 'equal_to' THEN v_order_count = expected_count
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

-- New function to check product rules
CREATE OR REPLACE FUNCTION check_product_rules(
  p_rules jsonb,
  p_order_id uuid
) RETURNS boolean AS $$
DECLARE
  v_meets_conditions boolean := true;
  v_group record;
  v_condition record;
  v_group_result boolean;
BEGIN
  -- Iterate through each group in the rules
  FOR v_group IN SELECT * FROM jsonb_array_elements(p_rules) WHERE value->>'type' IN ('group')
  LOOP
    v_group_result := CASE 
      WHEN v_group.value->>'match' = 'all' THEN true 
      ELSE false 
    END;

    -- Process each condition in the group
    FOR v_condition IN SELECT * FROM jsonb_array_elements(v_group.value->'conditions')
    LOOP
      CASE v_condition.value->>'type'
          WHEN 'category_amount' THEN
            v_group_result := CASE 
            WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_category_amount_condition(
                order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
              ELSE v_group_result OR check_category_amount_condition(
                order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
            END;
          
          WHEN 'category_purchased' THEN
            v_group_result := CASE 
              WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_category_purchased_condition(
                order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'value'
              )
              ELSE v_group_result OR check_category_purchased_condition(
                order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'value'
              )
            END;

          WHEN 'category_quantity' THEN
            v_group_result := CASE 
              WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_category_quantity_condition(
                order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
              ELSE v_group_result OR check_category_quantity_condition(
                order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
            END;

          WHEN 'product_purchased' THEN
            v_group_result := CASE 
              WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_product_purchased_condition(
                order_id,
                (v_condition.value->>'productId')::uuid
              )
              ELSE v_group_result OR check_product_purchased_condition(
                order_id,
                (v_condition.value->>'productId')::uuid
              )
            END;
            
          WHEN 'product_quantity' THEN
            v_group_result := CASE 
              WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_product_quantity_condition(
                order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
              ELSE v_group_result OR check_product_quantity_condition(
                order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
            END;
        END CASE;
    END LOOP;

    v_meets_conditions := v_meets_conditions AND v_group_result;
  END LOOP;

  RETURN v_meets_conditions;
END;
$$ LANGUAGE plpgsql;

-- Helper function for order value check
CREATE OR REPLACE FUNCTION check_order_value_condition(
  p_order_id uuid,
  operator text,
  expected_value numeric
) RETURNS boolean AS $$
DECLARE
  v_order_value numeric;
BEGIN
  SELECT total INTO v_order_value
  FROM orders
  WHERE id = p_order_id;

  RETURN CASE operator
    WHEN 'greater_than' THEN v_order_value > expected_value
    WHEN 'less_than' THEN v_order_value < expected_value
    WHEN 'equal_to' THEN v_order_value = expected_value
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function for recent purchase within days check
CREATE OR REPLACE FUNCTION check_recent_purchase_within_days_condition(
  p_customer_id uuid,
  expected_days integer
) RETURNS boolean AS $$
DECLARE
  v_recent_order_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM orders
    WHERE customer_id = p_customer_id
    AND status = 'completed'
    AND created_at >= NOW() - (expected_days || ' days')::interval
  ) INTO v_recent_order_exists;

  RETURN v_recent_order_exists;
END;
$$ LANGUAGE plpgsql;

-- Helper function for first purchase check
CREATE OR REPLACE FUNCTION check_first_purchase_condition(
  p_customer_id uuid,
  p_order_id uuid
) RETURNS boolean AS $$
DECLARE
  v_is_first_purchase boolean;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1
    FROM orders
    WHERE customer_id = p_customer_id
    AND status = 'completed'
    AND id != p_order_id
  ) INTO v_is_first_purchase;

  RETURN v_is_first_purchase;
END;
$$ LANGUAGE plpgsql;

-- Helper function for days since last order check
CREATE OR REPLACE FUNCTION check_days_since_order_condition(
  p_customer_id uuid,
  operator text,
  expected_days integer
) RETURNS boolean AS $$
DECLARE
  v_days_since_order integer;
BEGIN
  SELECT EXTRACT(DAY FROM NOW() - MAX(created_at))::integer INTO v_days_since_order
  FROM orders
  WHERE customer_id = p_customer_id
  AND status = 'completed';

  -- Handle case where customer has no previous orders
  IF v_days_since_order IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN CASE operator
    WHEN 'greater_than' THEN v_days_since_order > expected_days
    WHEN 'less_than' THEN v_days_since_order < expected_days
    WHEN 'equal_to' THEN v_days_since_order = expected_days
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function for average order value check
CREATE OR REPLACE FUNCTION check_avg_order_value_condition(
  p_customer_id uuid,
  operator text,
  expected_value numeric
) RETURNS boolean AS $$
DECLARE
  v_avg_order_value numeric;
BEGIN
  SELECT COALESCE(AVG(total), 0) INTO v_avg_order_value
  FROM orders
  WHERE customer_id = p_customer_id
  AND status = 'completed';

  RETURN CASE operator
    WHEN 'greater_than' THEN v_avg_order_value > expected_value
    WHEN 'less_than' THEN v_avg_order_value < expected_value
    WHEN 'equal_to' THEN v_avg_order_value = expected_value
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

-- Update main check_campaign_conditions function
CREATE OR REPLACE FUNCTION check_campaign_conditions(
  campaign_id uuid,
  order_id uuid
) RETURNS boolean AS $$
DECLARE
  v_campaign record;
  v_order record;
  v_conditions jsonb;
  v_condition record;
  v_meets_conditions boolean := true;
BEGIN
  -- Get campaign and order details
  SELECT * INTO v_campaign FROM campaigns WHERE id = campaign_id;
  SELECT * INTO v_order FROM orders WHERE id = order_id;
  
  -- Check product rules if enabled
  IF v_campaign.has_product_rules THEN
    v_meets_conditions := check_product_rules(v_campaign.product_rules, order_id);
  END IF;

  -- Check conditions if enabled
  IF v_campaign.has_conditions AND v_meets_conditions THEN
    v_conditions := v_campaign.conditions;
    
    FOR v_condition IN SELECT * FROM jsonb_array_elements(v_conditions)
    LOOP
      v_meets_conditions := v_meets_conditions AND CASE v_condition.value->>'type'
        WHEN 'lifetime_value' THEN
          check_lifetime_value_condition(
            v_order.customer_id,
            v_condition.value->>'operator',
            (v_condition.value->>'value')::numeric
          )
        WHEN 'account_age' THEN
          check_account_age_condition(
            v_order.customer_id,
            v_condition.value->>'operator',
            (v_condition.value->>'value')::integer
          )
        WHEN 'order_count' THEN
          check_order_count_condition(
            v_order.customer_id,
            v_condition.value->>'operator',
            (v_condition.value->>'value')::integer
          )
        WHEN 'order_value' THEN
          check_order_value_condition(
            order_id,
            v_condition.value->>'operator',
            (v_condition.value->>'value')::numeric
          )
        WHEN 'recent_purchase_within_days' THEN
          check_recent_purchase_within_days_condition(
            v_order.customer_id,
            (v_condition.value->>'value')::integer
          )
        WHEN 'first_purchase' THEN
          check_first_purchase_condition(
            v_order.customer_id,
            order_id
          )
        WHEN 'days_since_order' THEN
          check_days_since_order_condition(
            v_order.customer_id,
            v_condition.value->>'operator',
            (v_condition.value->>'value')::integer
          )
        WHEN 'avg_order_value' THEN
          check_avg_order_value_condition(
            v_order.customer_id,
            v_condition.value->>'operator',
            (v_condition.value->>'value')::numeric
          )
        ELSE TRUE
      END;
      
      EXIT WHEN NOT v_meets_conditions;
    END LOOP;
  END IF;

  RETURN v_meets_conditions;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate points
CREATE OR REPLACE FUNCTION calculate_campaign_points(
  campaign_id uuid,
  order_id uuid
) RETURNS numeric AS $$
DECLARE
  v_campaign record;
  v_order record;
  v_points numeric := 0;
BEGIN
  SELECT * INTO v_campaign FROM campaigns WHERE id = campaign_id;
  SELECT * INTO v_order FROM orders WHERE id = order_id;

  IF v_campaign.type = 'points_multiplier' THEN
    v_points := v_order.total * v_campaign.multiplier;
  ELSE
    v_points := v_campaign.bonus_points;
  END IF;

  RETURN v_points;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle order status changes
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

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS order_points_trigger ON orders;
CREATE TRIGGER order_points_trigger
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_points();

-- Create policies
CREATE POLICY "Users can view their store's points transactions"
  ON points_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = points_transactions.store_name
      AND profiles.id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON TABLE points_transactions TO authenticated;
GRANT SELECT ON TABLE points_transactions TO anon;

-- Add helpful comments
COMMENT ON TABLE points_transactions IS 'Records all points earned and redeemed by customers';
COMMENT ON FUNCTION check_campaign_conditions IS 'Checks if an order meets campaign conditions and rules';
COMMENT ON FUNCTION calculate_campaign_points IS 'Calculates points to be awarded for an order based on campaign type';
COMMENT ON FUNCTION handle_order_points IS 'Handles points calculation and recording when order status changes';
