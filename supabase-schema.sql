-- Shirt Order System Database Schema for Supabase
-- Created: 2025-01-07
-- Description: Tables for managing shirt orders for Tiger Thailand Meeting 2025

-- ============================================
-- 1. ORDERS TABLE
-- ============================================
-- Main table storing customer order information
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  is_pickup BOOLEAN NOT NULL DEFAULT false,
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  slip_image TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')
  ),
  CONSTRAINT address_required_for_delivery CHECK (
    is_pickup = true OR (is_pickup = false AND address IS NOT NULL AND address != '')
  )
);

-- ============================================
-- 2. ORDER_ITEMS TABLE
-- ============================================
-- Table storing individual items in each order
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  design VARCHAR(10) NOT NULL,
  size VARCHAR(10) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 5),
  price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key
  CONSTRAINT fk_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

  -- Constraints
  CONSTRAINT valid_design CHECK (design IN ('1', '2', '3', '4')),
  CONSTRAINT valid_size CHECK (
    size IN ('4S', 'SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL')
  )
);

-- ============================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================
-- Index on orders table
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_is_pickup ON orders(is_pickup);

-- Index on order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_design ON order_items(design);
CREATE INDEX IF NOT EXISTS idx_order_items_size ON order_items(size);

-- ============================================
-- 4. TRIGGER FOR UPDATED_AT
-- ============================================
-- Automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) - OPTIONAL
-- ============================================
-- Uncomment these if you want to enable RLS
-- Note: You'll need to configure authentication first

-- Enable RLS on tables
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy examples (customize based on your auth setup):
-- Allow public to insert orders (for customer submissions)
-- CREATE POLICY "Anyone can insert orders" ON orders
--   FOR INSERT
--   WITH CHECK (true);

-- Allow only authenticated admins to select all orders
-- CREATE POLICY "Admins can view all orders" ON orders
--   FOR SELECT
--   USING (auth.role() = 'authenticated');

-- Allow only authenticated admins to update orders
-- CREATE POLICY "Admins can update orders" ON orders
--   FOR UPDATE
--   USING (auth.role() = 'authenticated');

-- Allow public to insert order items (for customer submissions)
-- CREATE POLICY "Anyone can insert order items" ON order_items
--   FOR INSERT
--   WITH CHECK (true);

-- Allow only authenticated admins to select all order items
-- CREATE POLICY "Admins can view all order items" ON order_items
--   FOR SELECT
--   USING (auth.role() = 'authenticated');

-- ============================================
-- 6. HELPFUL VIEWS (OPTIONAL)
-- ============================================

-- View to get orders with item count and total items
CREATE OR REPLACE VIEW orders_summary AS
SELECT
  o.id,
  o.name,
  o.address,
  o.is_pickup,
  o.total_price,
  o.status,
  o.created_at,
  COUNT(oi.id) AS item_count,
  SUM(oi.quantity) AS total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- View to get size distribution across all orders
CREATE OR REPLACE VIEW size_distribution AS
SELECT
  design,
  size,
  SUM(quantity) AS total_quantity,
  COUNT(DISTINCT order_id) AS order_count
FROM order_items
GROUP BY design, size
ORDER BY design,
  CASE size
    WHEN '4S' THEN 1
    WHEN 'SSS' THEN 2
    WHEN 'SS' THEN 3
    WHEN 'S' THEN 4
    WHEN 'M' THEN 5
    WHEN 'L' THEN 6
    WHEN 'XL' THEN 7
    WHEN '2XL' THEN 8
    WHEN '3XL' THEN 9
    WHEN '4XL' THEN 10
    WHEN '5XL' THEN 11
    WHEN '6XL' THEN 12
  END;

-- ============================================
-- 7. SAMPLE DATA FOR TESTING (OPTIONAL)
-- ============================================
-- Uncomment to insert sample data for development

/*
-- Insert sample order
INSERT INTO orders (name, address, is_pickup, total_price, slip_image, status)
VALUES
  ('ทดสอบ ระบบ', '123 ถนนทดสอบ กรุงเทพฯ 10100', false, 1450.00, 'https://example.com/slip.jpg', 'pending'),
  ('Test User', '', true, 700.00, 'https://example.com/slip2.jpg', 'confirmed');

-- Insert sample order items
INSERT INTO order_items (order_id, design, size, quantity, price_per_unit)
VALUES
  (1, '1', 'L', 1, 750.00),
  (1, '2', 'XL', 1, 700.00),
  (2, '2', 'M', 1, 700.00);
*/

-- ============================================
-- 8. USEFUL QUERIES FOR REFERENCE
-- ============================================

-- Get all orders with their items (matches the API query pattern)
-- SELECT o.*,
--        json_agg(
--          json_build_object(
--            'design', oi.design,
--            'size', oi.size,
--            'quantity', oi.quantity,
--            'price_per_unit', oi.price_per_unit
--          )
--        ) as items
-- FROM orders o
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- GROUP BY o.id
-- ORDER BY o.created_at DESC;

-- Get order statistics by status
-- SELECT status, COUNT(*) as count, SUM(total_price) as total_revenue
-- FROM orders
-- GROUP BY status;

-- Get inventory needs (total quantity by design and size)
-- SELECT design, size, SUM(quantity) as total_needed
-- FROM order_items oi
-- JOIN orders o ON oi.order_id = o.id
-- WHERE o.status IN ('pending', 'confirmed', 'processing')
-- GROUP BY design, size
-- ORDER BY design, size;
