-- Add store_name column to oauth_provider_ids table
ALTER TABLE oauth_provider_ids
ADD COLUMN store_name text;

-- Add comment to the column
COMMENT ON COLUMN oauth_provider_ids.store_name IS 'The name of the store associated with this OAuth provider ID';