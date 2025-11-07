-- ============================================
-- COMPLETE DATABASE INITIALIZATION SCHEMA
-- ============================================
-- Shirt Order System for Tiger Thailand Meeting 2025
--
-- This is a complete, production-ready schema that includes:
-- 1. Orders and order items tables
-- 2. Shirt designs catalog with images
-- 3. Combo products system for bundled designs
-- 4. Indexes, triggers, and helpful views
--
-- Created: 2025-01-08
-- Run this single file to initialize the entire database from scratch

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
    size IN ('S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL')
  )
);

-- ============================================
-- 3. SHIRT_DESIGNS TABLE
-- ============================================
-- Catalog of available shirt designs with pricing and images
CREATE TABLE IF NOT EXISTS shirt_designs (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  front_image TEXT NOT NULL, -- Cloudinary URL
  back_image TEXT,            -- Cloudinary URL (nullable - back image is optional)
  is_active BOOLEAN DEFAULT true,
  is_combo BOOLEAN DEFAULT FALSE, -- True if this design is a combo/bundle of other designs
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. SHIRT_COMBO_COMPONENTS TABLE
-- ============================================
-- Defines which shirt designs are combo products and their component designs
CREATE TABLE IF NOT EXISTS shirt_combo_components (
  id BIGSERIAL PRIMARY KEY,
  combo_design_id VARCHAR(10) NOT NULL,      -- The combo product (e.g., '3')
  component_design_id VARCHAR(10) NOT NULL,  -- Component product (e.g., '1', '2')
  quantity_multiplier INT NOT NULL DEFAULT 1, -- How many of this component per combo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys to ensure data integrity
  CONSTRAINT fk_combo_design
    FOREIGN KEY (combo_design_id)
    REFERENCES shirt_designs(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_component_design
    FOREIGN KEY (component_design_id)
    REFERENCES shirt_designs(id)
    ON DELETE CASCADE,

  -- Ensure no duplicate entries
  CONSTRAINT unique_combo_component
    UNIQUE (combo_design_id, component_design_id),

  -- Ensure quantity multiplier is positive
  CONSTRAINT positive_quantity_multiplier
    CHECK (quantity_multiplier > 0)
);

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================
-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_is_pickup ON orders(is_pickup);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_design ON order_items(design);
CREATE INDEX IF NOT EXISTS idx_order_items_size ON order_items(size);

-- Shirt designs table indexes
CREATE INDEX IF NOT EXISTS idx_shirt_designs_active ON shirt_designs(is_active);
CREATE INDEX IF NOT EXISTS idx_shirt_designs_is_combo ON shirt_designs(is_combo);
CREATE INDEX IF NOT EXISTS idx_shirt_designs_order ON shirt_designs(display_order);

-- Combo components table indexes
CREATE INDEX IF NOT EXISTS idx_combo_design_id ON shirt_combo_components(combo_design_id);
CREATE INDEX IF NOT EXISTS idx_component_design_id ON shirt_combo_components(component_design_id);

-- ============================================
-- 6. TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================
-- Orders table updated_at trigger
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

-- Shirt designs table updated_at trigger
CREATE OR REPLACE FUNCTION update_shirt_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shirt_designs_updated_at
  BEFORE UPDATE ON shirt_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_shirt_designs_updated_at();

-- Combo components table updated_at trigger
CREATE OR REPLACE FUNCTION update_combo_components_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_combo_components_updated_at
  BEFORE UPDATE ON shirt_combo_components
  FOR EACH ROW
  EXECUTE FUNCTION update_combo_components_updated_at();

-- ============================================
-- 7. TABLE AND COLUMN COMMENTS
-- ============================================
COMMENT ON TABLE orders IS 'Stores customer orders for Tiger Thailand Meeting 2025';
COMMENT ON COLUMN orders.status IS 'Order status: pending, confirmed, processing, completed, or cancelled';
COMMENT ON COLUMN orders.slip_image IS 'URL to payment slip image (hosted on Cloudinary)';

COMMENT ON TABLE order_items IS 'Individual shirt items within each order';
COMMENT ON COLUMN order_items.design IS 'Shirt design ID (references shirt_designs.id)';

COMMENT ON TABLE shirt_designs IS 'Catalog of available shirt designs with pricing and images';
COMMENT ON COLUMN shirt_designs.id IS 'Design ID (e.g., ''1'', ''2'', ''3'', ''4'')';
COMMENT ON COLUMN shirt_designs.front_image IS 'Cloudinary URL for front image';
COMMENT ON COLUMN shirt_designs.back_image IS 'Cloudinary URL for back image';
COMMENT ON COLUMN shirt_designs.is_active IS 'Whether this design is currently available for ordering';
COMMENT ON COLUMN shirt_designs.is_combo IS 'True if this design is a combo/bundle of other designs. When ordered, it is split into component designs for inventory tracking.';
COMMENT ON COLUMN shirt_designs.display_order IS 'Order in which to display designs (lower = first)';

COMMENT ON TABLE shirt_combo_components IS 'Defines which shirt designs are combo products and their component designs';
COMMENT ON COLUMN shirt_combo_components.combo_design_id IS 'The shirt design ID that is a combo/bundle product';
COMMENT ON COLUMN shirt_combo_components.component_design_id IS 'The individual shirt design ID that is part of the combo';
COMMENT ON COLUMN shirt_combo_components.quantity_multiplier IS 'How many units of the component are included in one combo (e.g., 1 combo = 2x design 1 + 1x design 2)';

-- ============================================
-- 8. INITIAL DATA - SHIRT DESIGNS
-- ============================================
-- Insert the 4 default shirt designs
INSERT INTO shirt_designs (id, name, price, description, front_image, back_image, is_active, is_combo, display_order)
VALUES
  ('1', 'แบบที่ 1 เสื้อใส่เข้างาน', 750.00, 'เสื้อเจอร์ซีย์แขนยาว Tiger Thailand', '/images/shirts/design-1/front.jpg', '/images/shirts/design-1/back.jpg', true, false, 1),
  ('2', 'แบบที่ 2 เสื้อใส่เข้างาน', 700.00, 'เสื้อเจอร์ซีย์แขนสั้น Tiger Thailand', '/images/shirts/design-2/front.jpg', '/images/shirts/design-2/back.jpg', true, false, 2),
  ('3', 'แบบที่ 3 เสื้อใส่เข้างาน แพคคู่', 1100.00, 'เสื้อเจอร์ซีย์แขนยาวและแขนสั้น Tiger Thailand (ไซส์เดียวกัน)', '/images/shirts/design-3/front.jpg', '/images/shirts/design-3/back.jpg', true, true, 3),
  ('4', 'แบบที่ 4 เสื้อยืดที่ระลึก', 500.00, 'เสื้อยืด premium cotton', '/images/shirts/design-4/front.jpg', '/images/shirts/design-4/back.jpg', true, false, 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. INITIAL DATA - COMBO PRODUCTS
-- ============================================
-- Design #3 is a combo that includes:
--   - 1x Design #1 (เสื้อแขนยาว - Long sleeve work shirt)
--   - 1x Design #2 (เสื้อแขนสั้น - Short sleeve work shirt)
INSERT INTO shirt_combo_components (combo_design_id, component_design_id, quantity_multiplier)
VALUES
  ('3', '1', 1),  -- Design 3 includes 1x Design 1
  ('3', '2', 1)   -- Design 3 includes 1x Design 2
ON CONFLICT (combo_design_id, component_design_id) DO NOTHING;

-- ============================================
-- 10. HELPFUL VIEWS
-- ============================================
-- View to get orders with item count and total items
CREATE OR REPLACE VIEW orders_summary AS
SELECT
  o.id,
  o.name,
  o.phone,
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
    WHEN 'S' THEN 1
    WHEN 'M' THEN 2
    WHEN 'L' THEN 3
    WHEN 'XL' THEN 4
    WHEN '2XL' THEN 5
    WHEN '3XL' THEN 6
    WHEN '4XL' THEN 7
    WHEN '5XL' THEN 8
    WHEN '6XL' THEN 9
  END;

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS) - OPTIONAL
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

-- ============================================
-- 12. SAMPLE DATA (OPTIONAL)
-- ============================================
-- Uncomment to insert sample data for development/testing

/*
-- Insert sample orders
INSERT INTO orders (name, phone, address, is_pickup, total_price, slip_image, status)
VALUES
  ('สมชาย ทำการค้า', '0812345678', '123 ถนนทดสอบ กรุงเทพฯ 10100', false, 1450.00, 'https://res.cloudinary.com/dbkdy9jfe/image/upload/v1234567890/sample.jpg', 'pending'),
  ('สุนิตา สวยงาม', '0887654321', '', true, 700.00, 'https://res.cloudinary.com/dbkdy9jfe/image/upload/v1234567890/sample.jpg', 'confirmed');

-- Insert sample order items
INSERT INTO order_items (order_id, design, size, quantity, price_per_unit)
VALUES
  (1, '1', 'L', 1, 750.00),
  (1, '2', 'XL', 1, 700.00),
  (2, '2', 'M', 1, 700.00);
*/

-- ============================================
-- 13. USEFUL VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify the schema is set up correctly:

-- Check that all tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- View all shirt designs
-- SELECT id, name, price, is_active, is_combo FROM shirt_designs ORDER BY display_order;

-- View combo product relationships
-- SELECT
--   cc.combo_design_id,
--   sd1.name AS combo_name,
--   cc.component_design_id,
--   sd2.name AS component_name,
--   cc.quantity_multiplier
-- FROM shirt_combo_components cc
-- JOIN shirt_designs sd1 ON cc.combo_design_id = sd1.id
-- JOIN shirt_designs sd2 ON cc.component_design_id = sd2.id
-- ORDER BY cc.combo_design_id, cc.component_design_id;

-- Get order statistics
-- SELECT status, COUNT(*) as order_count, SUM(total_price) as total_revenue
-- FROM orders
-- GROUP BY status;

-- Get inventory needs (total quantity by design and size)
-- SELECT design, size, SUM(quantity) as total_needed
-- FROM order_items oi
-- JOIN orders o ON oi.order_id = o.id
-- WHERE o.status IN ('pending', 'confirmed', 'processing')
-- GROUP BY design, size
-- ORDER BY design, size;
