-- Create storage bucket for chat attachments
-- This bucket works for all message types (cohort messages, direct messages, etc.)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-attachments',
    'chat-attachments',
    true,
    10485760, -- 10MB in bytes
    ARRAY[
        -- Images (5MB limit enforced in app)
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp',
        -- Documents (10MB limit enforced in app)
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat_attachments bucket

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload chat attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow public to view attachments (access control is via database RLS on message_attachments table)
CREATE POLICY "Allow public to view chat attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-attachments');

-- Allow users to delete their own uploaded files
CREATE POLICY "Allow users to delete own chat attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their uploaded files
CREATE POLICY "Allow users to update own chat attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (bucket_id = 'chat-attachments');
