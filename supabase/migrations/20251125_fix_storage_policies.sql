-- First, drop any existing policies for announcement_attachments bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload announcement attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to announcement attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete announcement attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update announcement attachments" ON storage.objects;

-- Create more permissive policies for announcement_attachments bucket
-- Allow any authenticated user to insert
CREATE POLICY "announcement_attachments_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'announcement_attachments');

-- Allow anyone to read
CREATE POLICY "announcement_attachments_select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'announcement_attachments');

-- Allow authenticated users to delete
CREATE POLICY "announcement_attachments_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'announcement_attachments');

-- Allow authenticated users to update
CREATE POLICY "announcement_attachments_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'announcement_attachments');
