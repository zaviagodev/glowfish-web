-- Create oauth_provider_ids table
CREATE TABLE IF NOT EXISTS oauth_provider_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_user_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, provider_user_id)
);

-- Create indexes
CREATE INDEX oauth_provider_ids_user_idx ON oauth_provider_ids(user_id);
CREATE INDEX oauth_provider_ids_provider_idx ON oauth_provider_ids(provider);

-- Enable RLS
ALTER TABLE oauth_provider_ids ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own provider IDs"
  ON oauth_provider_ids
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage provider IDs"
  ON oauth_provider_ids
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON TABLE oauth_provider_ids TO authenticated;
GRANT ALL ON TABLE oauth_provider_ids TO service_role;

-- Add helpful comments
COMMENT ON TABLE oauth_provider_ids IS 'Stores OAuth provider user IDs for social login';
COMMENT ON COLUMN oauth_provider_ids.provider IS 'OAuth provider name (e.g., google, facebook)';
COMMENT ON COLUMN oauth_provider_ids.provider_user_id IS 'User ID from the OAuth provider';