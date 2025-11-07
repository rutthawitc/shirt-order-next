-- ============================================
-- Fix Invalid Shirt Design IDs
-- ============================================
-- This migration removes shirt designs with invalid IDs ('001', '002', etc.)
-- and ensures only designs with IDs '1', '2', '3', '4' are present

-- Delete designs with invalid IDs that violate the order_items constraint
DELETE FROM shirt_designs WHERE id IN ('001', '002', '003', '004', '5', '6', '7');

-- Verify remaining designs have valid IDs
-- SELECT * FROM shirt_designs;
