-- Create message_attachments table for storing file attachments
-- This table is generic and works with any message type (cohort messages, direct messages, etc.)

CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document')),
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id
    ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_created_at
    ON message_attachments(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE message_attachments IS 'Stores file attachments for chat messages (works with any message type)';
COMMENT ON COLUMN message_attachments.file_type IS 'Type of file: image or document';
COMMENT ON COLUMN message_attachments.file_size IS 'File size in bytes';

-- Make messages.content nullable to allow attachment-only messages
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;

-- Enable Row Level Security
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view attachments for messages in accessible cohorts
CREATE POLICY "Users can view message attachments"
    ON message_attachments FOR SELECT
    USING (
        message_id IN (
            SELECT m.id FROM messages m
            WHERE m.id IN (
                SELECT cm.message_id
                FROM cohort_messages cm
                WHERE cm.cohort_id IN (
                    -- Admins see all cohorts
                    SELECT c.id FROM cohorts c
                    WHERE EXISTS (
                        SELECT 1 FROM "user" u
                        WHERE u.id = auth.uid() AND u.role = 'admin'
                    )
                    UNION
                    -- Teachers see cohorts they teach
                    SELECT ws.cohort_id FROM weekly_sessions ws
                    JOIN teachers t ON ws.teacher_id = t.id
                    WHERE t.user_id = auth.uid()
                    UNION
                    -- Students see cohorts they're enrolled in
                    SELECT e.cohort_id FROM enrollments e
                    JOIN students s ON e.student_id = s.id
                    WHERE s.user_id = auth.uid()
                    AND e.status IN ('paid', 'welcome_package_sent', 'transitioning', 'offboarding')
                )
            )
        )
    );

-- RLS Policy: Authenticated users can add attachments to their own messages
CREATE POLICY "Users can add attachments to own messages"
    ON message_attachments FOR INSERT
    WITH CHECK (
        message_id IN (
            SELECT id FROM messages
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy: Users can delete attachments from their own messages
CREATE POLICY "Users can delete own message attachments"
    ON message_attachments FOR DELETE
    USING (
        message_id IN (
            SELECT id FROM messages
            WHERE user_id = auth.uid()
        )
    );

-- Enable realtime for message_attachments
ALTER PUBLICATION supabase_realtime ADD TABLE message_attachments;
