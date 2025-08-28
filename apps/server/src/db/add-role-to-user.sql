-- Add role field to existing Better Auth user table
-- Run this SQL directly in your database after the Drizzle migration

-- Add role column (using text type to be flexible, or use the enum if it was created)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'student'
CHECK (role IN ('admin', 'support', 'teacher', 'student'));

-- Add foreign key constraints to link teachers/students to users
ALTER TABLE "teachers" 
ADD CONSTRAINT "teachers_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;

ALTER TABLE "students" 
ADD CONSTRAINT "students_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "user"("role");

-- Optional: Set your first admin user
-- UPDATE "user" SET role = 'admin' WHERE email = 'your-admin@email.com';