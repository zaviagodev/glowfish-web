-- Drop handle_signup function
DROP FUNCTION IF EXISTS handle_signup(
    full_name TEXT,
    email TEXT,
    default_store_name TEXT,
    invite_token TEXT
); 

-- Create store_domains table
CREATE TABLE IF NOT EXISTS store_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT NOT NULL REFERENCES stores(name) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'failed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(domain)
);

-- Add RLS policies
ALTER TABLE store_domains ENABLE ROW LEVEL SECURITY;

-- Only store admins can manage domains
DROP POLICY IF EXISTS "Allow admins to manage domains" ON store_domains;
CREATE POLICY "Allow admins to manage domains"
ON store_domains
FOR ALL
USING (has_permission('can_manage_members', store_name));

-- Function to set primary domain
DROP FUNCTION IF EXISTS set_primary_domain(store_name TEXT, domain_id UUID);
CREATE OR REPLACE FUNCTION set_primary_domain(store_name TEXT, domain_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- First, unset any existing primary domain
    UPDATE store_domains
    SET is_primary = false
    WHERE store_domains.store_name = set_primary_domain.store_name;

    -- Then set the new primary domain
    UPDATE store_domains
    SET is_primary = true
    WHERE store_domains.store_name = set_primary_domain.store_name
    AND id = set_primary_domain.domain_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- enable pg_net extension
create extension pg_net;

-- Function to call manage-upstream Edge Function before domain deletion
CREATE OR REPLACE FUNCTION call_manage_upstream_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the manage-upstream Edge Function with DELETE method
    PERFORM net.http_delete(
        url := 'SUPABASE_PROJECT_URL' || '/functions/v1/manage-upstream?domain=' || OLD.domain::text,
        headers := jsonb_build_object(
            'Authorization', 'Bearer SUPABASE_ANON_KEY',
            'Content-Type', 'application/json'
        )
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call manage-upstream before domain deletion
DROP TRIGGER IF EXISTS trigger_manage_upstream_delete ON store_domains;
CREATE TRIGGER trigger_manage_upstream_delete
    BEFORE DELETE ON store_domains
    FOR EACH ROW
    EXECUTE FUNCTION call_manage_upstream_delete();

-- Add helpful comments
COMMENT ON TABLE store_domains IS 'Stores custom domains for each store';
COMMENT ON COLUMN store_domains.domain IS 'The custom domain (e.g., store.example.com)';
COMMENT ON COLUMN store_domains.is_primary IS 'Whether this is the primary domain for the store';
COMMENT ON COLUMN store_domains.status IS 'Domain status: pending (DNS verification), active (verified), failed (verification failed)';