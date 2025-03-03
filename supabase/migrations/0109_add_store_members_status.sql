-- Add status column to store_members table
ALTER TABLE store_members
ADD COLUMN status text NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'inactive'));

-- Add comment for the status column
COMMENT ON COLUMN store_members.status IS 'Status of the store member - can be either active or inactive';

-- Update has_permission function to check for active status
CREATE OR REPLACE FUNCTION has_permission(permission TEXT, store_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM store_members
    JOIN roles ON store_members.role_id = roles.id
    WHERE store_members.profile_id = auth.uid()
      AND store_members.store_name = has_permission.store_name
      AND store_members.status = 'active'
      AND roles.permissions->>has_permission.permission = 'true'
  );
$$ LANGUAGE SQL STABLE;

-- Update get_user_stores function to only return active memberships
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
    WHERE sm.profile_id = auth.uid()
    AND sm.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON FUNCTION has_permission IS 'Checks if the current user has a specific permission for a store, considering only active memberships';
COMMENT ON FUNCTION get_user_stores IS 'Returns all stores where the current user has an active membership'; 