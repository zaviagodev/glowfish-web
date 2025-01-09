-- Add unique constraint on product_categories
ALTER TABLE product_categories
  ADD CONSTRAINT product_categories_id_store_name_key 
  UNIQUE (id, store_name);

-- Now we can safely update the foreign key constraint
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey,
  ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id, store_name) 
    REFERENCES product_categories(id, store_name) 
    ON DELETE SET NULL;

-- Add helpful comment
COMMENT ON CONSTRAINT product_categories_id_store_name_key ON product_categories IS 
  'Ensures unique combination of id and store_name for proper foreign key referencing';