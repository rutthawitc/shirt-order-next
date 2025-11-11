-- Migration: Add Smaller Shirt Sizes Support
-- Created: 2025-01-11
-- Description: Adds '4S', 'SSS', and 'SS' sizes to the valid_size constraint
--              to support smaller shirt sizes for buyers

-- ============================================
-- 1. DROP OLD CONSTRAINT
-- ============================================
-- Remove the existing size constraint that only allows S-6XL
ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS valid_size;

-- ============================================
-- 2. ADD NEW CONSTRAINT WITH SMALLER SIZES
-- ============================================
-- Add new constraint that includes smaller sizes: 4S, SSS, SS
ALTER TABLE order_items
  ADD CONSTRAINT valid_size CHECK (
    size IN ('4S', 'SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL')
  );

-- ============================================
-- 3. VERIFICATION QUERY
-- ============================================
-- Run this to verify the constraint was updated successfully:
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conname = 'valid_size' AND conrelid = 'order_items'::regclass;

-- ============================================
-- 4. TEST QUERY (OPTIONAL)
-- ============================================
-- Uncomment to test that the new sizes are accepted:
/*
INSERT INTO order_items (order_id, design, size, quantity, price_per_unit)
VALUES (1, '1', '4S', 1, 750.00);

INSERT INTO order_items (order_id, design, size, quantity, price_per_unit)
VALUES (1, '1', 'SSS', 1, 750.00);

INSERT INTO order_items (order_id, design, size, quantity, price_per_unit)
VALUES (1, '1', 'SS', 1, 750.00);

-- Clean up test data
DELETE FROM order_items WHERE size IN ('4S', 'SSS', 'SS') AND order_id = 1;
*/
