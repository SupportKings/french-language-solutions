-- Remove room field from classes (will be inherited from cohort)
ALTER TABLE "classes" DROP COLUMN IF EXISTS "room";

-- Remove mode field from classes (will be inherited from cohort format)
ALTER TABLE "classes" DROP COLUMN IF EXISTS "mode";

-- Remove name field from classes (not needed)
ALTER TABLE "classes" DROP COLUMN IF EXISTS "name";

-- Remove unnecessary fields that were added
ALTER TABLE "classes" DROP COLUMN IF EXISTS "description";
ALTER TABLE "classes" DROP COLUMN IF EXISTS "materials";
ALTER TABLE "classes" DROP COLUMN IF EXISTS "max_students";
ALTER TABLE "classes" DROP COLUMN IF EXISTS "is_active";

-- Add foreign key constraint for teacher_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'classes_teacher_id_teachers_id_fk'
        AND table_name = 'classes'
    ) THEN
        ALTER TABLE "classes" 
        ADD CONSTRAINT "classes_teacher_id_teachers_id_fk" 
        FOREIGN KEY ("teacher_id") 
        REFERENCES "public"."teachers"("id") 
        ON DELETE SET NULL 
        ON UPDATE NO ACTION;
    END IF;
END $$;