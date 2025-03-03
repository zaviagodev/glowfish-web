-- Rename user_id to profile_id in store_members table
ALTER TABLE store_members
DROP CONSTRAINT IF EXISTS store_members_user_id_fkey,
DROP CONSTRAINT IF EXISTS store_members_user_id_store_name_key;

ALTER TABLE store_members
RENAME COLUMN user_id TO profile_id;

ALTER TABLE store_members ADD CONSTRAINT store_members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE;

ALTER TABLE store_members ADD CONSTRAINT store_members_profile_id_store_name_key UNIQUE (profile_id, store_name);

-- Update has_permission function to use profile_id
CREATE OR REPLACE FUNCTION has_permission(permission TEXT, store_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM store_members
    JOIN roles ON store_members.role_id = roles.id
    WHERE store_members.profile_id = auth.uid()
      AND store_members.store_name = has_permission.store_name
      AND roles.permissions->>has_permission.permission = 'true'
  );
$$ LANGUAGE SQL STABLE;

-- Update existing policies to use profile_id instead of user_id
DROP POLICY IF EXISTS "Allow users to view their memberships" ON store_members;
DROP POLICY IF EXISTS "Allow admins to manage members" ON store_members;
DROP POLICY IF EXISTS "Allow members to view their stores" ON stores;

CREATE POLICY "Allow users to view their memberships" ON store_members FOR
SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Allow admins to manage members" ON store_members FOR ALL USING (has_permission('can_manage_members', store_name));

CREATE POLICY "Allow members to view their stores" ON stores
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM store_members 
    WHERE store_members.store_name = stores.name 
    AND store_members.profile_id = auth.uid()
  )
);

-- Add helpful comment
COMMENT ON COLUMN store_members.profile_id IS 'References the profile ID of the member';