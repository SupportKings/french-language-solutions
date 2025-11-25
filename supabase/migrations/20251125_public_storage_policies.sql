-- Drop any existing policies for announcement_attachments bucket
DROP POLICY IF EXISTS "announcement_attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "announcement_attachments_select" ON storage.objects;
DROP POLICY IF EXISTS "announcement_attachments_delete" ON storage.objects;
DROP POLICY IF EXISTS "announcement_attachments_update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload announcement attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to announcement attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete announcement attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update announcement attachments" ON storage.objects;

-- Allow public insert (upload)
CREATE POLICY "announcement_attachments_public_insert"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'announcement_attachments');

-- Allow public read
CREATE POLICY "announcement_attachments_public_select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'announcement_attachments');

-- Allow public delete
CREATE POLICY "announcement_attachments_public_delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'announcement_attachments');

-- Allow public update
CREATE POLICY "announcement_attachments_public_update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'announcement_attachments')
WITH CHECK (bucket_id = 'announcement_attachments');
