-- Add shipping_cost column to orders table
-- This allows tracking of shipping costs separately from product prices

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0
CHECK (shipping_cost >= 0);

-- Add comment for clarity
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping/delivery cost for the order';
