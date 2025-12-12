-- Change announcements.author_id to reference user table instead of teachers table

-- Drop the existing foreign key constraint
ALTER TABLE announcements
DROP CONSTRAINT IF EXISTS announcements_author_id_fkey;

-- Add new foreign key constraint referencing user table
ALTER TABLE announcements
ADD CONSTRAINT announcements_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES "user"(id)
ON DELETE CASCADE;

-- Drop the old index
DROP INDEX IF EXISTS idx_announcements_author;

-- Recreate the index
CREATE INDEX idx_announcements_author ON announcements(author_id);
