-- Drop unique constraint on store_name in profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_store_name_key;

-- Create invites table
CREATE TABLE IF NOT EXISTS store_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT NOT NULL REFERENCES stores(name) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    max_uses INTEGER,
    uses INTEGER DEFAULT 0,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Add RLS policies
ALTER TABLE store_invites ENABLE ROW LEVEL SECURITY;

-- Only store admins can create invites
DROP POLICY IF EXISTS "Allow admins to create invites" ON store_invites;
CREATE POLICY "Allow admins to create invites" ON store_invites
FOR INSERT WITH CHECK (has_permission('can_manage_members', store_name));

-- Only store admins can view their store's invites
DROP POLICY IF EXISTS "Allow admins to view invites" ON store_invites;
CREATE POLICY "Allow admins to view invites" ON store_invites
FOR SELECT USING (has_permission('can_manage_members', store_name));

-- Function to get user's stores
CREATE OR REPLACE FUNCTION get_user_stores()
RETURNS TABLE (
    store_name TEXT,
    role_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.store_name,
        r.name AS role_name
    FROM store_members sm
    JOIN roles r ON r.id = sm.role_id
    WHERE sm.profile_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update default store
CREATE OR REPLACE FUNCTION update_default_store(new_store_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    -- Check if user has access to this store
    SELECT EXISTS (
        SELECT 1 FROM store_members sm
        WHERE sm.store_name = new_store_name
        AND sm.profile_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.default_store_name = new_store_name
    ) INTO has_access;

    IF NOT has_access THEN
        RAISE EXCEPTION 'You do not have access to this store';
    END IF;

    -- Update default store
    UPDATE profiles
    SET default_store_name = new_store_name
    WHERE id = auth.uid();

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fetch invite details
CREATE OR REPLACE FUNCTION get_invite_details(invite_token TEXT)
RETURNS TABLE (
    store_name TEXT,
    role_name TEXT,
    is_expired BOOLEAN,
    is_full BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.store_name,
        r.name AS role_name,
        COALESCE(i.expires_at < NOW(), FALSE) AS is_expired,
        COALESCE(i.uses >= i.max_uses, FALSE) AS is_full
    FROM store_invites i
    JOIN roles r ON r.id = i.role_id
    WHERE i.token = invite_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and use an invite
CREATE OR REPLACE FUNCTION use_invite(invite_token TEXT)
RETURNS TABLE (store_name TEXT, role_id UUID) AS $$
DECLARE
    invite_record store_invites%ROWTYPE;
BEGIN
    -- Get and lock the invite for update
    SELECT * INTO invite_record
    FROM store_invites
    WHERE token = invite_token
    FOR UPDATE;

    -- Check if invite exists
    IF invite_record IS NULL THEN
        RAISE EXCEPTION 'Invalid invite token';
    END IF;

    -- Check if invite has expired
    IF invite_record.expires_at IS NOT NULL AND invite_record.expires_at < NOW() THEN
        RAISE EXCEPTION 'Invite has expired';
    END IF;

    -- Check if invite has reached max uses
    IF invite_record.max_uses IS NOT NULL AND invite_record.uses >= invite_record.max_uses THEN
        RAISE EXCEPTION 'Invite has reached maximum uses';
    END IF;

    -- Add profile to store_members
    INSERT INTO store_members (store_name, profile_id, role_id)
    VALUES (invite_record.store_name, auth.uid(), invite_record.role_id);

    -- Increment uses
    UPDATE store_invites
    SET uses = uses + 1
    WHERE token = invite_token;

    -- Return store name and role
    RETURN QUERY
    SELECT invite_record.store_name, invite_record.role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle signup with invite support
CREATE OR REPLACE FUNCTION handle_signup(
    full_name TEXT,
    email TEXT,
    default_store_name TEXT,
    invite_token TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    store_exists BOOLEAN;
    profile_record profiles%ROWTYPE;
    admin_role_id UUID;
    invite_result RECORD;
BEGIN
    -- Check if this is an invite signup
    IF invite_token IS NOT NULL THEN
        -- Create profile with invited store
        INSERT INTO profiles (id, email, full_name, default_store_name)
        VALUES (auth.uid(), email, full_name, default_store_name)
        RETURNING * INTO profile_record;
        
        -- Use the invite and get store details
        SELECT * INTO invite_result FROM use_invite(invite_token);


        -- Return result
        RETURN to_jsonb(profile_record);
    ELSE
        -- Regular signup flow
        -- Check if store name is available
        SELECT EXISTS (
            SELECT 1 FROM stores WHERE name = default_store_name
        ) INTO store_exists;

        IF store_exists THEN
            RAISE EXCEPTION 'Store name is already taken';
        END IF;

        -- Create the store first
        INSERT INTO stores (name)
        VALUES (default_store_name);

        -- Create user profile
        INSERT INTO profiles (id, email, full_name, default_store_name)
        VALUES (auth.uid(), email, full_name, default_store_name)
        RETURNING * INTO profile_record;

        -- Get the admin role ID
        SELECT id INTO admin_role_id
        FROM roles
        WHERE name = 'admin'
        LIMIT 1;

        -- Add user as admin in store_members
        INSERT INTO store_members (profile_id, store_name, role_id)
        VALUES (auth.uid(), default_store_name, admin_role_id);

        -- Return result
        RETURN to_jsonb(profile_record);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create payment settings
CREATE OR REPLACE FUNCTION create_payment_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_settings (store_name)
  VALUES (NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_payment_settings_trigger ON profiles;

-- Create new trigger on stores table
CREATE TRIGGER create_payment_settings_trigger
  AFTER INSERT ON stores
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_settings();

-- Function to create store settings
CREATE OR REPLACE FUNCTION create_store_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO store_settings (store_name)
  VALUES (NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_store_settings_trigger ON profiles;

-- Create new trigger on stores table
CREATE TRIGGER create_store_settings_trigger
  AFTER INSERT ON stores
  FOR EACH ROW
  EXECUTE FUNCTION create_store_settings();