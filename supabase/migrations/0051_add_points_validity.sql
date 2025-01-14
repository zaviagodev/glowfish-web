-- Add points_validity column to coupons table
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS points_validity integer,
ADD CONSTRAINT coupons_points_validity_check CHECK (
    points_validity IS NULL
    OR points_validity > 0
);

-- Add helpful comment
COMMENT ON COLUMN coupons.points_validity IS 'Number of days before earned points expire';