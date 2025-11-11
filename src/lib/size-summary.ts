/**
 * Size Summary Utility Functions
 *
 * Processes order items to generate a size summary by shirt design,
 * handling combo product splitting automatically.
 *
 * This logic is shared between:
 * - Excel export endpoint
 * - Admin size summary page
 */

import { DBOrderItem } from '@/types/order'
import type { ComboMap, ComboComponentInfo } from '@/lib/combo-products'
import { ALL_SIZES } from '@/constants/shirt-designs';

/**
 * Minimal shirt design interface needed for size summary processing
 * Only requires id and name fields
 */
interface DesignInfo {
  id: string
  name: string
}

export interface SizeSummaryRow {
  'แบบเสื้อ': string;
  [key: string]: string | number;
}

/**
 * Process order items into a size summary table
 *
 * @param items - Array of order items from database
 * @param designs - Array of shirt designs with id and name
 * @param comboMap - Map of combo product relationships from getComboRelationships()
 * @returns Array of size summary rows with design name and size counts
 *
 * Features:
 * - Handles combo products by splitting into components
 * - Filters out combo products from final output (only shows components)
 * - Initializes all sizes (4S-6XL including SSS, SS) with zero for all designs
 */
export function processSizeSummary(
  items: DBOrderItem[],
  designs: DesignInfo[],
  comboMap: ComboMap
): SizeSummaryRow[] {
  const sizeCount = new Map<string, { [key: string]: number }>();
  const sizes = ALL_SIZES as readonly string[];

  // Create design name mapping from database
  const designNameMap = new Map(designs.map(d => [d.id, d.name]));

  // Initialize the map with all available designs
  if (designs) {
    designs.forEach(design => {
      sizeCount.set(design.id, Object.fromEntries(sizes.map(size => [size, 0])));
    });
  }

  // Process each order item
  items.forEach(item => {
    const design = item.design;
    const size = item.size;
    const quantity = item.quantity;

    // Check if this is a combo product (database-driven)
    const comboComponents = comboMap.get(design);

    if (comboComponents && comboComponents.length > 0) {
      // This is a combo product - split it into components
      comboComponents.forEach(comp => {
        if (sizeCount.has(comp.component) && size) {
          const designSizes = sizeCount.get(comp.component)!;
          designSizes[size] = (designSizes[size] || 0) + (quantity * comp.multiplier);
        }
      });
    } else if (sizeCount.has(design) && size) {
      // Normal processing for non-combo designs
      const designSizes = sizeCount.get(design)!;
      designSizes[size] = (designSizes[size] || 0) + quantity;
    }
  });

  // Convert to array format
  // Filter out combo products - only show their component designs in the summary
  const sizeSummary = Array.from(sizeCount.entries())
    .filter(([design]) => !comboMap.has(design)) // Exclude combo products
    .map(([design, sizeData]) => ({
      'แบบเสื้อ': designNameMap.get(design) || 'ไม่ระบุ',
      ...sizeData
    }));

  return sizeSummary;
}

/**
 * Calculate total count for each size across all designs
 *
 * @param sizeSummary - Size summary data from processSizeSummary()
 * @returns Object with total counts per size
 */
export function calculateSizeTotals(sizeSummary: SizeSummaryRow[]): { [key: string]: number } {
  const sizes = ALL_SIZES as readonly string[];
  const totals: { [key: string]: number } = {};

  sizes.forEach(size => {
    totals[size] = sizeSummary.reduce((sum, row) => {
      const value = row[size] as number;
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  });

  return totals;
}

/**
 * Calculate grand total of all shirts
 *
 * @param sizeSummary - Size summary data from processSizeSummary()
 * @returns Total count of all shirts across all sizes and designs
 */
export function calculateGrandTotal(sizeSummary: SizeSummaryRow[]): number {
  return Object.values(calculateSizeTotals(sizeSummary)).reduce((sum, total) => sum + total, 0);
}

/**
 * Find the design with the highest total quantity
 *
 * @param sizeSummary - Size summary data from processSizeSummary()
 * @returns Design name with highest total, or empty string if no data
 */
export function getMostPopularDesign(sizeSummary: SizeSummaryRow[]): string {
  const sizes = ALL_SIZES as readonly string[];
  let maxDesign = '';
  let maxTotal = 0;

  sizeSummary.forEach(row => {
    const total = sizes.reduce((sum, size) => {
      const value = row[size] as number;
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    if (total > maxTotal) {
      maxTotal = total;
      maxDesign = row['แบบเสื้อ'] as string;
    }
  });

  return maxDesign;
}

/**
 * Find the size with the highest total quantity across all designs
 *
 * @param sizeSummary - Size summary data from processSizeSummary()
 * @returns Size code with highest total (e.g., 'M'), or empty string if no data
 */
export function getMostPopularSize(sizeSummary: SizeSummaryRow[]): string {
  const totals = calculateSizeTotals(sizeSummary);
  let maxSize = '';
  let maxCount = 0;

  Object.entries(totals).forEach(([size, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxSize = size;
    }
  });

  return maxSize;
}
