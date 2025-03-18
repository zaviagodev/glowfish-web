-- Add can_read_members permission to admin role
UPDATE roles
SET permissions = permissions || '{"can_read_members": true}'::jsonb
WHERE name = 'admin';

-- Add helpful comment
COMMENT ON COLUMN roles.permissions IS 'JSON object containing role permissions including can_read, can_write, can_manage_members, can_read_members';

-- Create security definer functions to check permissions
CREATE OR REPLACE FUNCTION check_store_read_permission(check_store_name TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM store_members sm
        JOIN roles r ON sm.role_id = r.id
        WHERE sm.profile_id = auth.uid() 
        AND sm.store_name = check_store_name
        AND r.permissions->>'can_read_members' = 'true'
    );
END;
$$;

CREATE OR REPLACE FUNCTION check_store_manage_permission(check_store_name TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM store_members sm
        JOIN roles r ON sm.role_id = r.id
        WHERE sm.profile_id = auth.uid() 
        AND sm.store_name = check_store_name
        AND r.permissions->>'can_manage_members' = 'true'
    );
END;
$$;

-- Enable RLS
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;

-- Users can view their own memberships and admins can view all memberships in their store
DROP POLICY IF EXISTS "Allow users to view their memberships" ON store_members;
CREATE POLICY "Allow users to view their memberships" ON store_members
FOR SELECT USING (
    profile_id = auth.uid() OR check_store_read_permission(store_name)
);

-- Admins can manage members
DROP POLICY IF EXISTS "Allow admins to manage members" ON store_members;
CREATE POLICY "Allow admins to manage members" ON store_members
FOR ALL USING (check_store_manage_permission(store_name));