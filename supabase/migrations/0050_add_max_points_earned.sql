-- Add max_points_earned column to coupons table
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS max_points_earned integer,
ADD CONSTRAINT coupons_max_points_earned_check CHECK (
    max_points_earned IS NULL
    OR max_points_earned > 0
);

-- Add helpful comment
COMMENT ON COLUMN coupons.max_points_earned IS 'Maximum points that can be earned from this coupon';