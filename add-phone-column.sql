-- ============================================
-- Add Phone Column to Orders Table
-- ============================================
-- This migration adds a phone column to the orders table
-- to store customer phone numbers

-- Add phone column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add comment to explain the column
COMMENT ON COLUMN orders.phone IS 'Customer phone number for order contact';

-- Verify the change
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'orders'
-- ORDER BY ordinal_position;
