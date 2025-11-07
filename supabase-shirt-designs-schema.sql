-- ============================================
-- Shirt Designs Table Migration
-- ============================================
-- This migration adds a new table for managing shirt designs dynamically

-- Create shirt_designs table
CREATE TABLE IF NOT EXISTS shirt_designs (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  front_image TEXT NOT NULL, -- Cloudinary URL
  back_image TEXT,            -- Cloudinary URL (nullable - back image is optional)
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for active designs
CREATE INDEX idx_shirt_designs_active ON shirt_designs(is_active);
CREATE INDEX idx_shirt_designs_order ON shirt_designs(display_order);

-- Create updated_at trigger
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

-- Insert initial data from existing designs
INSERT INTO shirt_designs (id, name, price, description, front_image, back_image, is_active, display_order)
VALUES
  ('1', 'แบบที่ 1 เสื้อใส่เข้างาน', 750.00, 'เสื้อเจอร์ซีย์แขนยาว Tiger Thailand', '/images/shirts/design-1/front.jpg', '/images/shirts/design-1/back.jpg', true, 1),
  ('2', 'แบบที่ 2 เสื้อใส่เข้างาน', 700.00, 'เสื้อเจอร์ซีย์แขนสั้น Tiger Thailand', '/images/shirts/design-2/front.jpg', '/images/shirts/design-2/back.jpg', true, 2),
  ('3', 'แบบที่ 3 เสื้อใส่เข้างาน แพคคู่', 1100.00, 'เสื้อเจอร์ซีย์แขนยาวและแขนสั้น Tiger Thailand (ไซส์เดียวกัน)', '/images/shirts/design-3/front.jpg', '/images/shirts/design-3/back.jpg', true, 3),
  ('4', 'แบบที่ 4 เสื้อยืดที่ระลึก', 500.00, 'เสื้อยืด premium cotton', '/images/shirts/design-4/front.jpg', '/images/shirts/design-4/back.jpg', true, 4)
ON CONFLICT (id) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE shirt_designs IS 'Stores shirt design information including pricing and images';
COMMENT ON COLUMN shirt_designs.id IS 'Design ID (e.g., ''1'', ''2'', ''3'', ''4'')';
COMMENT ON COLUMN shirt_designs.front_image IS 'Cloudinary URL for front image';
COMMENT ON COLUMN shirt_designs.back_image IS 'Cloudinary URL for back image';
COMMENT ON COLUMN shirt_designs.is_active IS 'Whether this design is currently available for ordering';
COMMENT ON COLUMN shirt_designs.display_order IS 'Order in which to display designs (lower = first)';
