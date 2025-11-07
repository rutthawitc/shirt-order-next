// src/lib/combo-products.ts
import { supabase } from '@/lib/supabase'
import type { ComboComponent } from '@/types/order'

/**
 * Represents a component within a combo product
 */
export interface ComboComponentInfo {
  component: string      // Component design ID
  multiplier: number     // Quantity multiplier
}

/**
 * Map of combo design IDs to their component information
 */
export type ComboMap = Map<string, ComboComponentInfo[]>

/**
 * Fetches all combo product relationships from the database
 *
 * @returns A Map where keys are combo design IDs and values are arrays of component info
 *
 * @example
 * const comboMap = await getComboRelationships()
 * // Returns: Map { '3' => [{ component: '1', multiplier: 1 }, { component: '2', multiplier: 1 }] }
 */
export async function getComboRelationships(): Promise<ComboMap> {
  const { data, error } = await supabase
    .from('shirt_combo_components')
    .select('*')
    .order('combo_design_id')
    .order('component_design_id')

  if (error) {
    console.error('Error fetching combo relationships:', error)
    return new Map()
  }

  const comboMap = new Map<string, ComboComponentInfo[]>()

  data.forEach((cc: ComboComponent) => {
    if (!comboMap.has(cc.combo_design_id)) {
      comboMap.set(cc.combo_design_id, [])
    }
    comboMap.get(cc.combo_design_id)!.push({
      component: cc.component_design_id,
      multiplier: cc.quantity_multiplier
    })
  })

  return comboMap
}

/**
 * Checks if a design is a combo product
 *
 * @param designId - The shirt design ID to check
 * @returns True if the design is a combo product, false otherwise
 *
 * @example
 * const isCombo = await isComboProduct('3')
 * // Returns: true (for design #3)
 */
export async function isComboProduct(designId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('shirt_designs')
    .select('is_combo')
    .eq('id', designId)
    .single()

  if (error) {
    console.error(`Error checking if design ${designId} is a combo:`, error)
    return false
  }

  return data?.is_combo || false
}

/**
 * Gets all combo product IDs
 *
 * @returns Array of design IDs that are combo products
 *
 * @example
 * const comboIds = await getComboProductIds()
 * // Returns: ['3']
 */
export async function getComboProductIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('shirt_designs')
    .select('id')
    .eq('is_combo', true)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching combo product IDs:', error)
    return []
  }

  return data.map(d => d.id)
}

/**
 * Gets the component designs for a specific combo product
 *
 * @param comboDesignId - The combo product design ID
 * @returns Array of component information, or empty array if not found
 *
 * @example
 * const components = await getComboComponents('3')
 * // Returns: [{ component: '1', multiplier: 1 }, { component: '2', multiplier: 1 }]
 */
export async function getComboComponents(comboDesignId: string): Promise<ComboComponentInfo[]> {
  const { data, error } = await supabase
    .from('shirt_combo_components')
    .select('component_design_id, quantity_multiplier')
    .eq('combo_design_id', comboDesignId)
    .order('component_design_id')

  if (error) {
    console.error(`Error fetching components for combo ${comboDesignId}:`, error)
    return []
  }

  return data.map(cc => ({
    component: cc.component_design_id,
    multiplier: cc.quantity_multiplier
  }))
}

/**
 * Expands combo product order items into their component items
 * Used for inventory tracking and reporting
 *
 * @param items - Array of order items (may include combo products)
 * @param comboMap - Pre-fetched combo relationships map (optional, will fetch if not provided)
 * @returns Array of expanded items where combos are split into components
 *
 * @example
 * const items = [
 *   { design: '3', size: 'L', quantity: 2 },  // Combo product
 *   { design: '4', size: 'M', quantity: 1 }   // Regular product
 * ]
 * const expanded = await expandComboItems(items)
 * // Returns: [
 * //   { design: '1', size: 'L', quantity: 2 },  // From combo
 * //   { design: '2', size: 'L', quantity: 2 },  // From combo
 * //   { design: '4', size: 'M', quantity: 1 }   // Regular
 * // ]
 */
export async function expandComboItems<T extends { design: string; size: string; quantity: number }>(
  items: T[],
  comboMap?: ComboMap
): Promise<T[]> {
  // Fetch combo relationships if not provided
  const combos = comboMap || await getComboRelationships()

  const expandedItems: T[] = []

  for (const item of items) {
    const components = combos.get(item.design)

    if (components && components.length > 0) {
      // This is a combo product - split it into components
      components.forEach(comp => {
        expandedItems.push({
          ...item,
          design: comp.component,
          quantity: item.quantity * comp.multiplier
        })
      })
    } else {
      // Regular product - keep as is
      expandedItems.push(item)
    }
  }

  return expandedItems
}
