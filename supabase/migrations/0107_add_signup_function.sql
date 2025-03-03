-- Create a function to handle the complete signup process
CREATE OR REPLACE FUNCTION handle_signup(
  full_name TEXT,
  email TEXT,
  default_store_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql    
SECURITY DEFINER
AS $$
DECLARE
  admin_role_id UUID;
  profile_record profiles%ROWTYPE;
BEGIN
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

  -- Note: The following tables will be automatically created by their respective triggers:
  -- - payment_settings (via create_payment_settings trigger)
  -- - store_settings (via create_store_settings trigger)

  RETURN to_jsonb(profile_record);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_signup TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION handle_signup IS 'Handles the complete signup process including store creation and initialization of all required settings'; 