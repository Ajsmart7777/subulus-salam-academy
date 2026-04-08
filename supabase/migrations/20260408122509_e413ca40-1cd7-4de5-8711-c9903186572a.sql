
-- Create storage bucket for course banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-banners', 'course-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view course banners
CREATE POLICY "Public can view course banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-banners');

-- Allow authenticated users with admin or teacher role to upload course banners
CREATE POLICY "Admin and teachers can upload course banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-banners' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
);

-- Allow admin and teachers to update course banners
CREATE POLICY "Admin and teachers can update course banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-banners' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
);

-- Allow admin and teachers to delete course banners
CREATE POLICY "Admin and teachers can delete course banners"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-banners' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
);
