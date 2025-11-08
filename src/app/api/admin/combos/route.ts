// src/app/api/admin/combos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

/**
 * GET /api/admin/combos
 * Fetches all combo products with their components
 */
export async function GET() {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.has('admin_authenticated')

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all combo relationships with design names
    const { data: comboComponents, error: comboError } = await supabase
      .from('shirt_combo_components')
      .select(`
        id,
        combo_design_id,
        component_design_id,
        quantity_multiplier,
        created_at,
        updated_at
      `)
      .order('combo_design_id')
      .order('component_design_id')

    if (comboError) throw comboError

    // Fetch all shirt designs for mapping
    const { data: designs, error: designsError } = await supabase
      .from('shirt_designs')
      .select('id, name, is_combo')
      .order('id')

    if (designsError) throw designsError

    // Create design name map
    const designMap = new Map(designs.map(d => [d.id, d]))

    // Group components by combo_design_id
    const combos = new Map()
    comboComponents?.forEach(cc => {
      if (!combos.has(cc.combo_design_id)) {
        combos.set(cc.combo_design_id, {
          comboId: cc.combo_design_id,
          comboName: designMap.get(cc.combo_design_id)?.name || 'Unknown',
          isCombo: designMap.get(cc.combo_design_id)?.is_combo || false,
          components: []
        })
      }
      combos.get(cc.combo_design_id).components.push({
        id: cc.id,
        componentId: cc.component_design_id,
        componentName: designMap.get(cc.component_design_id)?.name || 'Unknown',
        multiplier: cc.quantity_multiplier
      })
    })

    return NextResponse.json({
      combos: Array.from(combos.values()),
      designs: designs
    })

  } catch (error) {
    console.error('Error fetching combos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch combos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/combos
 * Creates a new combo product relationship
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.has('admin_authenticated')

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { comboId, components } = body

    if (!comboId || !components || !Array.isArray(components) || components.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. comboId and components array required.' },
        { status: 400 }
      )
    }

    // Validate components
    for (const comp of components) {
      if (!comp.componentId || !comp.multiplier || comp.multiplier <= 0) {
        return NextResponse.json(
          { error: 'Invalid component data. Each component must have componentId and positive multiplier.' },
          { status: 400 }
        )
      }
    }

    // Start a transaction: mark design as combo and insert components
    // First, mark the design as combo
    const { error: updateError } = await supabaseAdmin
      .from('shirt_designs')
      .update({ is_combo: true })
      .eq('id', comboId)

    if (updateError) throw updateError

    // Delete existing components for this combo (if updating)
    const { error: deleteError } = await supabaseAdmin
      .from('shirt_combo_components')
      .delete()
      .eq('combo_design_id', comboId)

    if (deleteError) throw deleteError

    // Insert new components
    const componentsToInsert = components.map(comp => ({
      combo_design_id: comboId,
      component_design_id: comp.componentId,
      quantity_multiplier: comp.multiplier
    }))

    const { error: insertError } = await supabaseAdmin
      .from('shirt_combo_components')
      .insert(componentsToInsert)

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      message: 'Combo product created successfully'
    })

  } catch (error) {
    console.error('Error creating combo:', error)
    return NextResponse.json(
      { error: 'Failed to create combo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/combos?comboId=X
 * Deletes a combo product relationship
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.has('admin_authenticated')

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const comboId = searchParams.get('comboId')

    if (!comboId) {
      return NextResponse.json(
        { error: 'comboId parameter required' },
        { status: 400 }
      )
    }

    // Delete all components for this combo
    const { error: deleteError } = await supabaseAdmin
      .from('shirt_combo_components')
      .delete()
      .eq('combo_design_id', comboId)

    if (deleteError) throw deleteError

    // Mark design as non-combo
    const { error: updateError } = await supabaseAdmin
      .from('shirt_designs')
      .update({ is_combo: false })
      .eq('id', comboId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Combo product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting combo:', error)
    return NextResponse.json(
      { error: 'Failed to delete combo' },
      { status: 500 }
    )
  }
}
