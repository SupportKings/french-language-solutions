-- Storage policies for announcement_attachments bucket

-- Allow authenticated users (teachers) to upload files
CREATE POLICY "Allow authenticated users to upload announcement attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'announcement_attachments');

-- Allow public read access to announcement attachments
CREATE POLICY "Allow public read access to announcement attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'announcement_attachments');

-- Allow authenticated users to delete their uploaded files
CREATE POLICY "Allow authenticated users to delete announcement attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'announcement_attachments');

-- Allow authenticated users to update their uploaded files
CREATE POLICY "Allow authenticated users to update announcement attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'announcement_attachments')
WITH CHECK (bucket_id = 'announcement_attachments');
