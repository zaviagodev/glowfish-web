-- Add customer_group_id column to customers table
ALTER TABLE customers
ADD COLUMN customer_group_id UUID REFERENCES customer_groups(id);

-- Add an index on customer_group_id for better query performance
CREATE INDEX idx_customers_customer_group_id ON customers(customer_group_id);