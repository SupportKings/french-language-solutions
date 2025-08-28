-- Update marked_by to reference teachers table
ALTER TABLE "attendance_records" 
ADD CONSTRAINT "attendance_records_marked_by_teachers_id_fk" 
FOREIGN KEY ("marked_by") REFERENCES "teachers"("id") ON DELETE SET NULL;