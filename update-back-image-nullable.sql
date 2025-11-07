-- ============================================
-- Update shirt_designs Schema
-- ============================================
-- This migration makes the back_image column nullable
-- to support single-sided shirt designs

-- Modify back_image column to allow NULL values
ALTER TABLE shirt_designs
ALTER COLUMN back_image DROP NOT NULL;

-- Verify the change
-- SELECT column_name, is_nullable, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'shirt_designs'
-- ORDER BY ordinal_position;
