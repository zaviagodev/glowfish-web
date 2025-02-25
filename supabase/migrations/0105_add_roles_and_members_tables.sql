-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create members table
CREATE TABLE store_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL REFERENCES stores(name) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, store_name)
); 

-- Insert default roles
INSERT INTO roles (name, permissions)
VALUES
  ('admin', '{"can_read": true, "can_write": true, "can_manage_members": true}'),
  ('editor', '{"can_read": true, "can_write": true, "can_manage_members": false}'),
  ('viewer', '{"can_read": true, "can_write": false, "can_manage_members": false}');

-- Migrate existing profiles to stores_members table
INSERT INTO store_members (user_id, store_name, role_id)
SELECT id, default_store_name, (SELECT id FROM roles WHERE name = 'admin')
FROM profiles;


CREATE OR REPLACE FUNCTION has_permission(permission TEXT, store_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM store_members
    JOIN roles ON store_members.role_id = roles.id
    WHERE store_members.user_id = auth.uid()
      AND store_members.store_name = has_permission.store_name
      AND roles.permissions->>has_permission.permission = 'true'
  );
$$ LANGUAGE SQL STABLE;

-- Users can see stores they're members of
CREATE POLICY "Allow members to view their stores" ON stores
FOR SELECT USING (
  EXISTS (SELECT 1 FROM store_members WHERE store_members.store_name = stores.name AND store_members.user_id = auth.uid())
);

-- Users can view their own memberships
CREATE POLICY "Allow users to view their memberships" ON store_members
FOR SELECT USING (user_id = auth.uid());

-- Admins can manage members
CREATE POLICY "Allow admins to manage members" ON store_members
FOR ALL USING (has_permission('can_manage_members', store_name));


-- DROP POLICIES
DROP POLICY "Users can delete their store's products" ON products;
DROP POLICY "Users can insert products to their store" ON products;
DROP POLICY "Users can update their store's products" ON products;
DROP POLICY "Users can view their store's products" ON products;
DROP POLICY "Users can manage their store's events" ON events;
DROP POLICY "Users can manage their store's variants" ON product_variants;
DROP POLICY "Enable full access for authenticated users" ON product_categories;
DROP POLICY "Enable full access for authenticated users" ON product_tags;
DROP POLICY "Users can manage their store's product images" ON product_images;

DROP POLICY "Users can view their store's orders" ON orders;
DROP POLICY "Users can insert orders to their store" ON orders;
DROP POLICY "Users can update their store's orders" ON orders;
DROP POLICY "Users can delete their store's orders" ON orders;
DROP POLICY "Users can manage their store's order items" ON order_items;

DROP POLICY "Users can view their store's customers" ON customers;
DROP POLICY "Users can insert customers to their store" ON customers;
DROP POLICY "Users can update their store's customers" ON customers;
DROP POLICY "Users can delete their store's customers" ON customers;
DROP POLICY "Users can view their store's customer addresses" ON customer_addresses;
DROP POLICY "Users can insert addresses to their store's customers" ON customer_addresses;
DROP POLICY "Users can update their store's customer addresses" ON customer_addresses;
DROP POLICY "Users can delete their store's customer addresses" ON customer_addresses;
DROP POLICY "Users can manage their store's groups" ON customer_groups;
DROP POLICY "Users can view their store's customer tiers" ON customer_tiers;
DROP POLICY "Users can manage their store's tiers" ON customer_tiers;

DROP POLICY "Users can manage their store's coupons" ON coupons;

DROP POLICY "Users can manage their store's campaigns" ON campaigns;
DROP POLICY "Users can manage their store's campaign codes" ON campaign_codes;

-- Read access based on permission PRODUCTS
CREATE POLICY "Allow read with can_read" ON products
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission PRODUCTS
CREATE POLICY "Allow write with can_write" ON products
FOR INSERT WITH CHECK (has_permission('can_write', store_name));

CREATE POLICY "Allow update with can_write" ON products
FOR UPDATE USING (has_permission('can_write', store_name));

CREATE POLICY "Allow delete with can_write" ON products
FOR DELETE USING (has_permission('can_write', store_name));

-- Read access based on permission Events
CREATE POLICY "Allow read with can_read" ON events
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission Events
CREATE POLICY "Allow write with can_write" ON events
FOR ALL USING (has_permission('can_write', store_name));

-- Read access based on permission PRODUCT_VARIANTS
CREATE POLICY "Allow read with can_read" ON product_variants
FOR SELECT USING (has_permission('can_read', (SELECT store_name FROM products WHERE product_variants.product_id = products.id)));

-- Write access based on permission PRODUCT_VARIANTS
CREATE POLICY "Allow write with can_write" ON product_variants
FOR INSERT
WITH CHECK (
    has_permission('can_write', (SELECT store_name FROM products WHERE product_variants.product_id = products.id))
);

CREATE POLICY "Allow update with can_write" ON product_variants
FOR UPDATE
USING (
    has_permission('can_write', (SELECT store_name FROM products WHERE product_variants.product_id = products.id))
);

CREATE POLICY "Allow delete with can_write" ON product_variants
FOR DELETE
USING (
    has_permission('can_write', (SELECT store_name FROM products WHERE product_variants.product_id = products.id))
);

-- Read access based on permission PRODUCT_CATEGORIES
CREATE POLICY "Allow read with can_read" ON product_categories
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission PRODUCT_CATEGORIES
CREATE POLICY "Allow write with can_write" ON product_categories
FOR INSERT WITH CHECK (has_permission('can_write', store_name));

-- Read access based on permission PRODUCT_TAGS
CREATE POLICY "Allow read with can_read" ON product_tags
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission PRODUCT_TAGS
CREATE POLICY "Allow write with can_write" ON product_tags
FOR INSERT WITH CHECK (has_permission('can_write', store_name));

-- Read access based on permission PRODUCT_IMAGES
CREATE POLICY "Allow read with can_read" ON product_images
FOR SELECT USING (has_permission('can_read', (SELECT store_name FROM products WHERE product_images.product_id = products.id)));

-- Write access based on permission PRODUCT_IMAGES
CREATE POLICY "Allow write with can_write" ON product_images
FOR INSERT WITH CHECK (has_permission('can_write', (SELECT store_name FROM products WHERE product_images.product_id = products.id)));

CREATE POLICY "Allow update with can_write" ON product_images
FOR UPDATE USING (has_permission('can_write', (SELECT store_name FROM products WHERE product_images.product_id = products.id)));

CREATE POLICY "Allow delete with can_write" ON product_images
FOR DELETE USING (has_permission('can_write', (SELECT store_name FROM products WHERE product_images.product_id = products.id)));


-- Read access based on permission ORDERS
CREATE POLICY "Allow read with can_read" ON orders
FOR SELECT USING (has_permission('can_read', store_name));  

-- Write access based on permission ORDERS
CREATE POLICY "Allow write with can_write" ON orders
FOR INSERT WITH CHECK (has_permission('can_write', store_name));  

CREATE POLICY "Allow update with can_write" ON orders
FOR UPDATE USING (has_permission('can_write', store_name));

CREATE POLICY "Allow delete with can_write" ON orders
FOR DELETE USING (has_permission('can_write', store_name));

-- Read access based on permission ORDER_ITEMS
CREATE POLICY "Allow read with can_read" ON order_items
FOR SELECT USING (has_permission('can_read', (SELECT store_name FROM orders WHERE order_items.order_id = orders.id)));

CREATE POLICY "Allow update with can_write" ON order_items
FOR ALL USING (has_permission('can_write', (SELECT store_name FROM orders WHERE order_items.order_id = orders.id)));

-- Read access based on permission CUSTOMERS
CREATE POLICY "Allow read with can_read" ON customers
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission CUSTOMERS
CREATE POLICY "Allow write with can_write" ON customers
FOR ALL USING (has_permission('can_write', store_name));

-- Read access based on permission CUSTOMER_ADDRESSES
CREATE POLICY "Allow read with can_read" ON customer_addresses
FOR SELECT USING (has_permission('can_read', (SELECT store_name FROM customers WHERE customer_addresses.customer_id = customers.id)));

-- Write access based on permission CUSTOMER_ADDRESSES
CREATE POLICY "Allow write with can_write" ON customer_addresses
FOR ALL USING (has_permission('can_write', (SELECT store_name FROM customers WHERE customer_addresses.customer_id = customers.id)));

-- Read access based on permission CUSTOMER_GROUPS
CREATE POLICY "Allow read with can_read" ON customer_groups
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission CUSTOMER_GROUPS
CREATE POLICY "Allow write with can_write" ON customer_groups
FOR ALL USING (has_permission('can_write', store_name));

-- Read access based on permission CUSTOMER_TIERS
CREATE POLICY "Allow read with can_read" ON customer_tiers
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission CUSTOMER_TIERS
CREATE POLICY "Allow write with can_write" ON customer_tiers
FOR ALL USING (has_permission('can_write', store_name));

-- Read access based on permission COUPONS
CREATE POLICY "Allow read with can_read" ON coupons
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission COUPONS
CREATE POLICY "Allow write with can_write" ON coupons
FOR ALL USING (has_permission('can_write', store_name));

-- Read access based on permission CAMPAIGNS
CREATE POLICY "Allow read with can_read" ON campaigns
FOR SELECT USING (has_permission('can_read', store_name));

-- Write access based on permission CAMPAIGNS
CREATE POLICY "Allow write with can_write" ON campaigns
FOR ALL USING (has_permission('can_write', store_name));

-- Read access based on permission CAMPAIGN_CODES
CREATE POLICY "Allow read with can_read" ON campaign_codes
FOR SELECT USING (has_permission('can_read', (SELECT store_name FROM campaigns WHERE campaign_codes.campaign_id = campaigns.id)));

-- Write access based on permission CAMPAIGN_CODES
CREATE POLICY "Allow write with can_write" ON campaign_codes
FOR ALL USING (has_permission('can_write', (SELECT store_name FROM campaigns WHERE campaign_codes.campaign_id = campaigns.id)));

























