// src/constants/shirt-designs.ts
// Shirt designs are now fetched from Supabase database (shirt_designs table)
// See: src/lib/supabase.ts for database queries

// Valid shirt sizes - MUST match database constraint in order_items table
// See: supabase-schema.sql and add-smaller-sizes.sql migration
export const SIZES = ['4S','SSS','SS','S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'] as const;

// All sizes as a plain string array (for runtime use in components and utilities)
// This is the canonical list used across the application
export const ALL_SIZES: readonly string[] = SIZES;

// TypeScript type for shirt sizes
export type ShirtSize = typeof SIZES[number];

// Validation helper function
export function isValidSize(size: string): size is ShirtSize {
  return SIZES.includes(size as ShirtSize);
}