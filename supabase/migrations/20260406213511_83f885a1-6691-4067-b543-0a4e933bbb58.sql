
-- Create storage bucket for lesson content
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-content', 'lesson-content', true);

-- Teachers can upload content
CREATE POLICY "Teachers can upload lesson content"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-content');

-- Teachers can update their uploads
CREATE POLICY "Teachers can update lesson content"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lesson-content');

-- Teachers can delete their uploads
CREATE POLICY "Teachers can delete lesson content"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lesson-content');

-- Anyone can view lesson content (public bucket)
CREATE POLICY "Anyone can view lesson content"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'lesson-content');
