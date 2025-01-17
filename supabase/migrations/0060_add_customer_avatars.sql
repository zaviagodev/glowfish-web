-- Add date_of_birth and avatar_url columns to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add helpful comments
COMMENT ON COLUMN customers.date_of_birth IS 'Customer''s date of birth';
COMMENT ON COLUMN customers.avatar_url IS 'URL to customer''s avatar image';

-- Create index for date_of_birth for birthday queries
CREATE INDEX IF NOT EXISTS customers_date_of_birth_idx ON customers(date_of_birth);

-- Allow public access to customer avatars in product-images bucket
CREATE POLICY "Public Access to Customer Avatars" ON storage.objects FOR SELECT
USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[2] = 'customers'
    AND (storage.foldername(name))[3] = 'avatars'
);

-- Allow authenticated users to upload their avatars
CREATE POLICY "Authenticated Users Can Upload Avatars" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (
        SELECT store_name FROM public.customers
        WHERE id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'customers'
    AND (storage.foldername(name))[3] = 'avatars'
);

-- Allow users to update their own avatars
CREATE POLICY "Users Can Update Their Avatars" ON storage.objects FOR UPDATE TO authenticated 
USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (
        SELECT store_name FROM public.customers
        WHERE id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'customers'
    AND (storage.foldername(name))[3] = 'avatars'
)
WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (
        SELECT store_name FROM public.customers
        WHERE id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'customers'
    AND (storage.foldername(name))[3] = 'avatars'
);

-- Allow users to delete their own avatars
CREATE POLICY "Users Can Delete Their Avatars" ON storage.objects FOR DELETE TO authenticated 
USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (
        SELECT store_name FROM public.customers
        WHERE id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'customers'
    AND (storage.foldername(name))[3] = 'avatars'
);

COMMENT ON POLICY "Public Access to Customer Avatars" ON storage.objects IS 'Allow public read access to customer avatars under store/customers/avatars/';
COMMENT ON POLICY "Authenticated Users Can Upload Avatars" ON storage.objects IS 'Allow authenticated users to upload avatars with size limit';
COMMENT ON POLICY "Users Can Update Their Avatars" ON storage.objects IS 'Allow users to update their avatars';
COMMENT ON POLICY "Users Can Delete Their Avatars" ON storage.objects IS 'Allow users to delete their avatars';