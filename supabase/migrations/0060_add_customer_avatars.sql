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
    AND (OCTET_LENGTH(DECODE(SUBSTRING(name FROM '%#"_____"#"%' FOR '#'), 'base64')) < 5242880)
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