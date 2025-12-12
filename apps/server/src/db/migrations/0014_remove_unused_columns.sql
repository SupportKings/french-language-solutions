-- Drop unused columns from language_levels table
ALTER TABLE "language_levels" 
DROP COLUMN IF EXISTS "sort_order",
DROP COLUMN IF EXISTS "is_active";