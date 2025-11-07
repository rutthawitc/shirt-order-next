-- ============================================
-- Add Combo Products System
-- ============================================
-- This migration adds a database-driven combo product system that allows
-- shirt designs to be bundled together. When customers order a combo product,
-- the system automatically splits it into individual component products for
-- inventory tracking and reporting.
--
-- Example: Design #3 (combo pack) splits into Design #1 + Design #2
-- ============================================

-- 1. Create combo components table
-- ============================================
-- This table stores the relationships between combo products and their components
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_combo_design_id ON shirt_combo_components(combo_design_id);
CREATE INDEX IF NOT EXISTS idx_component_design_id ON shirt_combo_components(component_design_id);

-- Add comment to table and columns
COMMENT ON TABLE shirt_combo_components IS 'Defines which shirt designs are combo products and their component designs';
COMMENT ON COLUMN shirt_combo_components.combo_design_id IS 'The shirt design ID that is a combo/bundle product';
COMMENT ON COLUMN shirt_combo_components.component_design_id IS 'The individual shirt design ID that is part of the combo';
COMMENT ON COLUMN shirt_combo_components.quantity_multiplier IS 'How many units of the component are included in one combo (e.g., 1 combo = 2x design 1 + 1x design 2)';

-- 2. Add updated_at trigger for combo components table
-- ============================================
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

-- 3. Add is_combo flag to shirt_designs table
-- ============================================
-- This flag identifies which designs are combo products for easy filtering
ALTER TABLE shirt_designs
ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN shirt_designs.is_combo IS 'True if this design is a combo/bundle of other designs. When ordered, it will be split into component designs for inventory tracking.';

-- Create index for filtering combo products
CREATE INDEX IF NOT EXISTS idx_shirt_designs_is_combo ON shirt_designs(is_combo);

-- 4. Migrate existing design #3 combo relationship
-- ============================================
-- Design #3 (เสื้อแขนสั้น +เสื้อแขนยาว แพคคู่) is currently hardcoded in export logic
-- We're migrating it to the database for better maintainability

-- Mark design #3 as a combo product
UPDATE shirt_designs
SET is_combo = TRUE
WHERE id = '3';

-- Insert combo components for design #3
-- Design #3 includes:
--   - 1x Design #1 (เสื้อแขนยาว - Long sleeve work shirt)
--   - 1x Design #2 (เสื้อแขนสั้น - Short sleeve work shirt)
INSERT INTO shirt_combo_components (combo_design_id, component_design_id, quantity_multiplier)
VALUES
  ('3', '1', 1),  -- Design 3 includes 1x Design 1 (long sleeve)
  ('3', '2', 1)   -- Design 3 includes 1x Design 2 (short sleeve)
ON CONFLICT (combo_design_id, component_design_id) DO NOTHING;

-- 5. Verification queries (commented out)
-- ============================================
-- Uncomment these to verify the migration was successful:

-- Check that combo components table was created
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'shirt_combo_components'
-- ORDER BY ordinal_position;

-- Check that is_combo flag was added
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'shirt_designs' AND column_name = 'is_combo';

-- View combo products
-- SELECT id, name, is_combo FROM shirt_designs WHERE is_combo = TRUE;

-- View combo relationships
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
