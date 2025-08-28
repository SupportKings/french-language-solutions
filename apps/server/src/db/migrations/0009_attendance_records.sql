-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE, -- Optional: link to specific class session
    
    -- Attendance data
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unset' CHECK (status IN ('unset', 'attended', 'not_attended')),
    
    -- Additional fields
    notes TEXT, -- Optional notes about the attendance (e.g., "Left early", "Joined late")
    marked_by UUID REFERENCES users(id), -- Teacher/admin who marked attendance
    marked_at TIMESTAMPTZ, -- When the attendance was marked
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Ensure unique attendance record per student per date per cohort
    UNIQUE(student_id, cohort_id, attendance_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_cohort_id ON attendance_records(cohort_id);
CREATE INDEX idx_attendance_records_class_id ON attendance_records(class_id);
CREATE INDEX idx_attendance_records_attendance_date ON attendance_records(attendance_date);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
CREATE INDEX idx_attendance_records_student_cohort_date ON attendance_records(student_id, cohort_id, attendance_date);

-- Create updated_at trigger
CREATE TRIGGER update_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view attendance records
CREATE POLICY "Authenticated users can view attendance records" 
    ON attendance_records FOR SELECT 
    TO authenticated 
    USING (true);

-- Create policy for authenticated users to insert attendance records
CREATE POLICY "Authenticated users can insert attendance records" 
    ON attendance_records FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Create policy for authenticated users to update attendance records
CREATE POLICY "Authenticated users can update attendance records" 
    ON attendance_records FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Create policy for authenticated users to delete attendance records
CREATE POLICY "Authenticated users can delete attendance records" 
    ON attendance_records FOR DELETE 
    TO authenticated 
    USING (true);

-- Add comments for documentation
COMMENT ON TABLE attendance_records IS 'Tracks student attendance for cohort classes';
COMMENT ON COLUMN attendance_records.id IS 'Unique identifier for the attendance record';
COMMENT ON COLUMN attendance_records.student_id IS 'Reference to the student';
COMMENT ON COLUMN attendance_records.cohort_id IS 'Reference to the cohort';
COMMENT ON COLUMN attendance_records.class_id IS 'Optional reference to specific class session';
COMMENT ON COLUMN attendance_records.attendance_date IS 'Date of the class/attendance';
COMMENT ON COLUMN attendance_records.status IS 'Attendance status: unset (default), attended, not_attended';
COMMENT ON COLUMN attendance_records.notes IS 'Optional notes about the attendance';
COMMENT ON COLUMN attendance_records.marked_by IS 'User who marked the attendance';
COMMENT ON COLUMN attendance_records.marked_at IS 'Timestamp when attendance was marked';