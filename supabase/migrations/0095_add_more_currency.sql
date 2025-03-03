-- Update store_settings currency constraint to include THB
ALTER TABLE store_settings
DROP CONSTRAINT IF EXISTS store_settings_currency_check;

ALTER TABLE store_settings ADD CONSTRAINT store_settings_currency_check CHECK (currency IN ('USD', 'EUR', 'GBP', 'THB', 'CNY'));