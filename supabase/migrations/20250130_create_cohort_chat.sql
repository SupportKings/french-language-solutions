-- =====================================================
-- Cohort Chat System Migration
-- =====================================================
-- Creates tables for real-time cohort messaging with:
-- - messages table for chat messages
-- - cohort_messages junction table
-- - message_reads for read tracking
-- - RLS policies for access control
-- - Realtime publication configuration
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

-- Messages table (core message data)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Cohort messages junction table (links messages to cohorts)
CREATE TABLE IF NOT EXISTS cohort_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, cohort_id)
);

-- Message reads table (track who has read each message)
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NULL;

-- Cohort messages indexes
CREATE INDEX IF NOT EXISTS idx_cohort_messages_cohort_id ON cohort_messages(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_messages_message_id ON cohort_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_cohort_messages_created_at ON cohort_messages(created_at DESC);

-- Message reads indexes
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON message_reads(user_id);

-- =====================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

-- SELECT: Users can view messages they have access to
CREATE POLICY "Users can view messages in accessible cohorts"
    ON messages FOR SELECT
    USING (
        id IN (
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
    );

-- INSERT: Authenticated users can create messages
CREATE POLICY "Authenticated users can create messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can edit their own messages
CREATE POLICY "Users can edit own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can soft delete their own messages (via UPDATE to set deleted_at)
-- No explicit DELETE policy - we use soft deletes via UPDATE

-- =====================================================
-- COHORT_MESSAGES TABLE POLICIES
-- =====================================================

-- SELECT: Users can view cohort message links for accessible cohorts
CREATE POLICY "Users can view cohort message links"
    ON cohort_messages FOR SELECT
    USING (
        cohort_id IN (
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
    );

-- INSERT: Users can link messages to cohorts they have access to
CREATE POLICY "Users can link messages to accessible cohorts"
    ON cohort_messages FOR INSERT
    WITH CHECK (
        cohort_id IN (
            -- Admins can link to all cohorts
            SELECT c.id FROM cohorts c
            WHERE EXISTS (
                SELECT 1 FROM "user" u
                WHERE u.id = auth.uid() AND u.role = 'admin'
            )
            UNION
            -- Teachers can link to cohorts they teach
            SELECT ws.cohort_id FROM weekly_sessions ws
            JOIN teachers t ON ws.teacher_id = t.id
            WHERE t.user_id = auth.uid()
            UNION
            -- Students can link to cohorts they're enrolled in
            SELECT e.cohort_id FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE s.user_id = auth.uid()
            AND e.status IN ('paid', 'welcome_package_sent', 'transitioning', 'offboarding')
        )
    );

-- =====================================================
-- MESSAGE_READS TABLE POLICIES
-- =====================================================

-- SELECT: Users can view read receipts for messages they can access
CREATE POLICY "Users can view message reads"
    ON message_reads FOR SELECT
    USING (
        message_id IN (
            SELECT m.id FROM messages m
            WHERE m.id IN (
                SELECT cm.message_id
                FROM cohort_messages cm
                WHERE cm.cohort_id IN (
                    -- Admins see all
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

-- INSERT: Users can mark messages as read
CREATE POLICY "Users can create read receipts"
    ON message_reads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- REALTIME CONFIGURATION
-- =====================================================

-- Enable realtime for messages table (for edit/delete updates)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for cohort_messages table (for new messages)
ALTER PUBLICATION supabase_realtime ADD TABLE cohort_messages;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on message edits
CREATE TRIGGER update_messages_updated_at_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- =====================================================
-- STORAGE BUCKET FOR CHAT ATTACHMENTS (Optional - for future use)
-- =====================================================

-- Note: Storage bucket creation is typically done via Supabase dashboard or separate migration
-- Uncomment if you want to create it here:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('chat-attachments', 'chat-attachments', true)
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE messages IS 'Stores chat messages with soft delete support';
COMMENT ON TABLE cohort_messages IS 'Junction table linking messages to cohorts';
COMMENT ON TABLE message_reads IS 'Tracks which users have read which messages';

COMMENT ON COLUMN messages.edited_at IS 'Timestamp of last edit (NULL if never edited)';
COMMENT ON COLUMN messages.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';
