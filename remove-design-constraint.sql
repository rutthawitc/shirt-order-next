-- ============================================
-- Remove Hardcoded Design Constraint
-- ============================================
-- This migration removes the hardcoded valid_design constraint from order_items
-- to support dynamic shirt design management through the admin UI.
--
-- Background:
-- The original schema had: CHECK (design IN ('1', '2', '3', '4'))
-- This prevents ordering new designs added through the admin interface.
--
-- Solution:
-- 1. Drop the hardcoded constraint
-- 2. Add a foreign key to shirt_designs table for referential integrity
-- ============================================

-- Drop the old hardcoded constraint
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS valid_design;

-- Add foreign key constraint to shirt_designs table
-- This ensures that only valid design IDs from shirt_designs can be used
ALTER TABLE order_items
ADD CONSTRAINT fk_shirt_design
  FOREIGN KEY (design)
  REFERENCES shirt_designs(id)
  ON DELETE RESTRICT;  -- Prevent deleting designs that have orders

-- Add comment for documentation
COMMENT ON CONSTRAINT fk_shirt_design ON order_items IS
  'Ensures design references valid shirt_designs.id. Prevents deleting designs with existing orders.';

-- Verify the changes
-- Uncomment to run verification queries:

-- 1. Check that the old constraint is gone
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'order_items' AND constraint_name = 'valid_design';
-- (Should return 0 rows)

-- 2. Check that the new foreign key exists
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'order_items' AND constraint_name = 'fk_shirt_design';
-- (Should return 1 row with constraint_type = 'FOREIGN KEY')

-- 3. Verify foreign key details
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name = 'order_items'
--   AND tc.constraint_name = 'fk_shirt_design';

-- ============================================
-- Benefits of This Migration
-- ============================================
-- ✅ Supports dynamic design management through admin UI
-- ✅ No code changes needed when adding new designs
-- ✅ Better data integrity with foreign key constraint
-- ✅ Prevents deleting designs that have existing orders
-- ✅ Allows any design ID format (not just '1', '2', '3', '4')
-- ✅ Scales to unlimited number of shirt designs

-- ============================================
-- What This Fixes
-- ============================================
-- Before: Order creation fails with error:
--   "new row for relation "order_items" violates check constraint "valid_design""
--
-- After: Orders can be created for any design in shirt_designs table
--   including Design #5, #6, #7, etc.
