-- Migration: Add unique constraint to teachers.email and make it NOT NULL
-- This ensures no duplicate teacher emails in the system

-- Step 1: Update any NULL emails to a placeholder (if any exist)
-- This is necessary before adding NOT NULL constraint
UPDATE teachers
SET email = 'pending-' || id || '@example.com'
WHERE email IS NULL;

-- Step 2: Add NOT NULL constraint
ALTER TABLE teachers
ALTER COLUMN email SET NOT NULL;

-- Step 3: Add unique constraint on email
ALTER TABLE teachers
ADD CONSTRAINT teachers_email_unique UNIQUE (email);
