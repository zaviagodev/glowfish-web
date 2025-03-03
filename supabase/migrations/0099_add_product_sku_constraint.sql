-- First, update NULL SKUs to empty string to standardize
UPDATE products 
SET sku = '' 
WHERE sku IS NULL;

-- Create a temporary function to handle duplicates
CREATE OR REPLACE FUNCTION handle_duplicate_skus() 
RETURNS void AS $$
DECLARE
    duplicate RECORD;
    counter INTEGER;
    empty_sku RECORD;
BEGIN
    -- First handle empty SKUs by generating a basic SKU from product name or ID
    FOR empty_sku IN (
        SELECT id, store_name, name, sku
        FROM products
        WHERE sku = ''
    ) LOOP
        -- Generate SKU from name if available, otherwise use ID
        UPDATE products 
        SET sku = CASE 
            WHEN name IS NOT NULL AND name != '' THEN 
                LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g'), '-+', '-', 'g'))
            ELSE 
                'product-' || id
            END,
        updated_at = NOW()
        WHERE id = empty_sku.id;
    END LOOP;

    -- Then handle any remaining duplicates
    FOR duplicate IN (
        SELECT store_name, sku, array_agg(id) as ids
        FROM products
        GROUP BY store_name, sku
        HAVING COUNT(*) > 1
    ) LOOP
        counter := 1;
        -- Skip the first ID (keep original SKU)
        FOR i IN 2..array_length(duplicate.ids, 1) LOOP
            -- Update duplicate SKUs by appending a suffix
            UPDATE products 
            SET sku = sku || '-' || counter,
                updated_at = NOW()
            WHERE id = duplicate.ids[i];
            counter := counter + 1;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to handle duplicates
SELECT handle_duplicate_skus();

-- Drop the temporary function
DROP FUNCTION handle_duplicate_skus();

-- Now add the unique constraint
ALTER TABLE products
ADD CONSTRAINT products_store_name_sku_key UNIQUE (store_name, sku);

-- Add helpful comment
COMMENT ON CONSTRAINT products_store_name_sku_key ON products IS 'Ensures SKU uniqueness within each store';