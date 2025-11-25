-- Fix announcements.author_id type to match user.id (text instead of uuid)

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE announcements
DROP CONSTRAINT IF EXISTS announcements_author_id_fkey;

-- Step 2: Change author_id column type from UUID to TEXT
ALTER TABLE announcements
ALTER COLUMN author_id TYPE TEXT USING author_id::TEXT;

-- Step 3: Add new foreign key constraint referencing user table
ALTER TABLE announcements
ADD CONSTRAINT announcements_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES "user"(id)
ON DELETE CASCADE;

-- Step 4: Drop and recreate the index
DROP INDEX IF EXISTS idx_announcements_author;
CREATE INDEX idx_announcements_author ON announcements(author_id);
