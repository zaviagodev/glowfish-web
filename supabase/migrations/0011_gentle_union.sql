/*
  # Add Product Media Support

  1. Changes
    - Add path column to product_images table
    - Add storage bucket policies for product images

  2. Security
    - Enable RLS for storage bucket
    - Add policy for authenticated users to manage their store's images
*/

-- Add path column for storage reference
ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS path text;

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name)
VALUES ('product-images', 'product-images')
ON CONFLICT DO NOTHING;

-- Enable RLS on storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage bucket policy
CREATE POLICY "Users can manage their store's product images"
  ON storage.objects
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (bucket_id = 'product-images' AND
     (storage.foldername(name))[1] = (
       SELECT store_name FROM profiles
       WHERE id = auth.uid()
     ))
  );