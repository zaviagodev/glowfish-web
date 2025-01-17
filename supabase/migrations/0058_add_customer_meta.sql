-- Add meta column to customers table
ALTER TABLE "public"."customers"
ADD COLUMN IF NOT EXISTS "meta" JSONB DEFAULT '{}'::jsonb;

-- Add comment to describe the column
COMMENT ON COLUMN "public"."customers"."meta" IS 'Additional metadata for the customer stored as JSON';