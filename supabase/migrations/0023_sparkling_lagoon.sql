-- Initialize store settings for existing stores
INSERT INTO store_settings (store_name)
SELECT store_name 
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM store_settings s 
  WHERE s.store_name = profiles.store_name
);

-- Add trigger to automatically create store settings for new stores
CREATE OR REPLACE FUNCTION create_store_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO store_settings (store_name)
  VALUES (NEW.store_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_store_settings_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_store_settings();

-- Add helpful comment
COMMENT ON FUNCTION create_store_settings IS 'Automatically creates store settings when a new store is created';