-- Update coupons status constraint to only allow 'draft' and 'active'
ALTER TABLE coupons
DROP CONSTRAINT IF EXISTS coupons_status_check;

-- Update any existing records that have 'scheduled' or 'expired' status to 'draft'
UPDATE coupons
SET
    status = 'draft'
WHERE
    status IN ('scheduled', 'expired');

ALTER TABLE coupons ADD CONSTRAINT coupons_status_check CHECK (status IN ('draft', 'active'));
