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
                p_order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
              ELSE v_group_result OR check_category_amount_condition(
                p_order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
            END;
          
          WHEN 'category_purchased' THEN
            v_group_result := CASE 
              WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_category_purchased_condition(
                p_order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'value'
              )
              ELSE v_group_result OR check_category_purchased_condition(
                p_order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'value'
              )
            END;

          WHEN 'category_quantity' THEN
            v_group_result := CASE 
              WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_category_quantity_condition(
                p_order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
              ELSE v_group_result OR check_category_quantity_condition(
                p_order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
            END;

          WHEN 'product_purchased' THEN
            v_group_result := CASE 
              WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_product_purchased_condition(
                p_order_id,
                (v_condition.value->>'productId')::uuid
              )
              ELSE v_group_result OR check_product_purchased_condition(
                p_order_id,
                (v_condition.value->>'productId')::uuid
              )
            END;
            
          WHEN 'product_quantity' THEN
            v_group_result := CASE 
              WHEN v_group.value->>'match' = 'all' 
              THEN v_group_result AND check_product_quantity_condition(
                p_order_id,
                (v_condition.value->>'productId')::uuid,
                v_condition.value->>'operator',
                (v_condition.value->>'value')::integer
              )
              ELSE v_group_result OR check_product_quantity_condition(
                p_order_id,
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