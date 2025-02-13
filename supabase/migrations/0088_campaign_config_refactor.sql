-- Drop existing type check constraint
ALTER TABLE campaigns
DROP CONSTRAINT IF EXISTS campaigns_type_check;

-- Add updated type check constraint
ALTER TABLE campaigns ADD CONSTRAINT campaigns_type_check CHECK (
    type IN (
        'points_multiplier',
        'bonus_points',
        'scan_to_get_points',
        'click_link_to_get_points'
    )
);

-- Add new config column as JSONB
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS config JSONB;

-- Drop existing columns and add config column
ALTER TABLE campaigns
DROP COLUMN IF EXISTS target_type,
DROP COLUMN IF EXISTS bonus_points,
DROP COLUMN IF EXISTS multiplier,
DROP COLUMN IF EXISTS qr_enabled,
DROP COLUMN IF EXISTS qr_point_type,
DROP COLUMN IF EXISTS qr_point_value,
DROP COLUMN IF EXISTS qr_scan_limit,
DROP COLUMN IF EXISTS qr_total_scans,
DROP COLUMN IF EXISTS click_link_enabled,
DROP COLUMN IF EXISTS click_link_limit;

-- Drop check constraint
ALTER TABLE campaigns
DROP CONSTRAINT IF EXISTS campaign_config_check;

-- Add check constraint to validate config based on campaign type
ALTER TABLE campaigns ADD CONSTRAINT campaign_config_check CHECK (
    (
        type = 'bonus_points'
        AND (config ? 'bonusPoints')
        AND jsonb_typeof (config->'bonusPoints') = 'number'
    )
    OR (
        type = 'points_multiplier'
        AND (config ? 'multiplier')
        AND jsonb_typeof (config->'multiplier') = 'number'
    )
    OR (
        type = 'scan_to_get_points'
        AND (config ? 'points')
        AND jsonb_typeof (config->'points') = 'number'
        AND (
            (
                config ? 'supply'
                AND (
                    jsonb_typeof (config->'supply') = 'number'
                    OR jsonb_typeof (config->'supply') = 'null'
                )
            )
        )
        AND (
            (
                config ? 'maxClaims'
                AND jsonb_typeof (config->'maxClaims') = 'number'
            )
            OR NOT (config ? 'maxClaims')
        )
    )
    OR (
        type = 'click_link_to_get_points'
        AND (config ? 'points')
        AND jsonb_typeof (config->'points') = 'number'
        AND (
            (
                config ? 'supply'
                AND jsonb_typeof (config->'supply') = 'number'
            )
            OR NOT (config ? 'supply')
        )
        AND (
            (
                config ? 'maxClaims'
                AND jsonb_typeof (config->'maxClaims') = 'number'
            )
            OR NOT (config ? 'maxClaims')
        )
    )
);

-- Drop existing functions
DROP FUNCTION IF EXISTS calculate_campaign_points;
DROP FUNCTION IF EXISTS redeem_campaign;

-- Update calculate_campaign_points
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
    v_points := v_order.total * v_campaign.config->'multiplier';
  ELSE
    v_points := v_campaign.config->'bonusPoints';
  END IF;

  RETURN v_points;
END;
$$ LANGUAGE plpgsql;