ALTER TABLE events 
ADD COLUMN gallery_link TEXT,
ADD COLUMN customer_group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL;