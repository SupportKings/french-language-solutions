-- Create enum for announcement scope
CREATE TYPE announcement_scope AS ENUM ('school_wide', 'cohort');

-- Create announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Stores rich HTML content
  author_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  scope announcement_scope NOT NULL DEFAULT 'cohort',
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Ensure cohort_id is provided when scope is 'cohort'
  CONSTRAINT cohort_required_for_cohort_scope
    CHECK (scope = 'school_wide' OR (scope = 'cohort' AND cohort_id IS NOT NULL))
);

-- Create announcement_attachments table
CREATE TABLE announcement_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'document'
  file_size BIGINT NOT NULL, -- File size in bytes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create announcement_reads table
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Ensure a student can only mark an announcement as read once
  CONSTRAINT unique_announcement_read UNIQUE (announcement_id, student_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_cohort ON announcements(cohort_id);
CREATE INDEX idx_announcements_scope ON announcements(scope);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX idx_announcements_deleted_at ON announcements(deleted_at);

CREATE INDEX idx_announcement_attachments_announcement ON announcement_attachments(announcement_id);

CREATE INDEX idx_announcement_reads_announcement ON announcement_reads(announcement_id);
CREATE INDEX idx_announcement_reads_student ON announcement_reads(student_id);
CREATE INDEX idx_announcement_reads_read_at ON announcement_reads(read_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER announcements_updated_at_trigger
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_announcements_updated_at();

-- Add comments for documentation
COMMENT ON TABLE announcements IS 'Stores announcements created by admins and teachers';
COMMENT ON TABLE announcement_attachments IS 'Stores file attachments for announcements (images, videos, documents)';
COMMENT ON TABLE announcement_reads IS 'Tracks which students have read which announcements';

COMMENT ON COLUMN announcements.scope IS 'Determines if announcement is school-wide or cohort-specific';
COMMENT ON COLUMN announcements.cohort_id IS 'Required when scope is cohort, null for school_wide';
COMMENT ON COLUMN announcements.is_pinned IS 'Pinned announcements appear first in lists';
COMMENT ON COLUMN announcements.deleted_at IS 'Soft delete timestamp, null means not deleted';
COMMENT ON COLUMN announcement_attachments.file_type IS 'Type of file: image, video, or document';
COMMENT ON COLUMN announcement_reads.read_at IS 'Timestamp when student read the announcement';
