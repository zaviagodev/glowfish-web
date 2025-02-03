/*
  Payment Settings
  - PromptPay
  - Bank Transfer
  - Notifications
*/

CREATE TABLE IF NOT EXISTS payment_settings (
  store_name text PRIMARY KEY REFERENCES profiles(store_name) ON DELETE CASCADE,
  
  -- PromptPay Settings
  promptpay_enabled boolean DEFAULT false,
  promptpay_qr_code_url text,
  promptpay_id text,
  promptpay_name text,
  
  -- Bank Transfer Settings
  bank_transfer_enabled boolean DEFAULT false,
  bank_accounts jsonb DEFAULT '[]',
  
  -- Notifications
  notify_email boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for store owners
CREATE POLICY "Users can manage their store's payment settings"
  ON payment_settings
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = payment_settings.store_name
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.store_name = payment_settings.store_name
      AND profiles.id = auth.uid()
    )
  );

-- Create function first
CREATE OR REPLACE FUNCTION create_payment_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_settings (store_name)
  VALUES (NEW.store_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Then create the trigger that uses the function
CREATE TRIGGER create_payment_settings_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_settings();

-- Initialize payment settings for existing stores
INSERT INTO payment_settings (store_name)
SELECT store_name 
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM payment_settings s 
  WHERE s.store_name = profiles.store_name
);

-- Add helpful comment
COMMENT ON TABLE payment_settings IS 'Stores payment configuration for each store';