// src/lib/shirt-designs.ts
import { supabase } from '@/lib/supabase'
import { DBShirtDesign, ShirtDesign } from '@/types/order'

/**
 * Fetch active shirt designs from the database
 * Transforms DB format to client format
 */
export async function getShirtDesigns(): Promise<ShirtDesign[]> {
  const { data: designs, error } = await supabase
    .from('shirt_designs')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching shirt designs:', error)
    throw new Error('Failed to fetch shirt designs')
  }

  // Transform DB format to client format
  return designs.map((design: DBShirtDesign) => ({
    id: design.id,
    name: design.name,
    price: design.price,
    description: design.description,
    images: [design.front_image, design.back_image] as const
  }))
}

/**
 * Fetch a single shirt design by ID
 */
export async function getShirtDesignById(id: string): Promise<DBShirtDesign | null> {
  const { data: design, error } = await supabase
    .from('shirt_designs')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching shirt design:', error)
    return null
  }

  return design
}

/**
 * Get price map for all active designs
 * Used for server-side price validation
 */
export async function getShirtPriceMap(): Promise<Record<string, number>> {
  const { data: designs, error } = await supabase
    .from('shirt_designs')
    .select('id, price')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching shirt prices:', error)
    throw new Error('Failed to fetch shirt prices')
  }

  return designs.reduce((acc: Record<string, number>, design: { id: string; price: number }) => {
    acc[design.id] = design.price
    return acc
  }, {})
}
