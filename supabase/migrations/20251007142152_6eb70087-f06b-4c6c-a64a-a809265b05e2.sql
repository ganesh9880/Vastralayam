-- Add admin role for existing user (dummy admin for testing)
INSERT INTO public.user_roles (user_id, role)
VALUES ('5200a2e4-212a-479b-9f89-dbb62e1831af', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Phase 7: Create storage buckets for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('category-images', 'category-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' 
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' 
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Storage policies for category images
CREATE POLICY "Category images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'category-images' 
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update category images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'category-images' 
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete category images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'category-images' 
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );