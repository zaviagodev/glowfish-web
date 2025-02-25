-- Remove unused columns from coupons table
ALTER TABLE coupons
DROP COLUMN IF EXISTS max_points_earned,
DROP COLUMN IF EXISTS points_validity,
DROP COLUMN IF EXISTS advanced_mode;