// src/app/api/admin/size-summary/export/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getComboRelationships } from '@/lib/combo-products'
import { processSizeSummary, calculateSizeTotals } from '@/lib/size-summary'
import { ALL_SIZES } from '@/constants/shirt-designs'
import * as XLSX from 'xlsx'
import type { DBOrderItem, DBShirtDesign } from '@/types/order'

/**
 * Export size summary to Excel
 * Allows admin to export current size summary data as a spreadsheet
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters for status filtering
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('statuses')
    const selectedStatuses = statusParam ? statusParam.split(',') : []

    // Fetch required data from Supabase
    const [ordersResult, itemsResult, designsResult] = await Promise.all([
      supabase.from('orders').select('id, status'),
      supabase.from('order_items').select('*'),
      supabase.from('shirt_designs').select('*')
    ])

    if (ordersResult.error) throw ordersResult.error
    if (itemsResult.error) throw itemsResult.error
    if (designsResult.error) throw designsResult.error

    const orders = ordersResult.data || []
    let items = (itemsResult.data || []) as DBOrderItem[]
    const designs = (designsResult.data || []) as DBShirtDesign[]

    // Create status map for filtering
    const orderStatusMap = new Map(orders.map(o => [o.id, o.status]))

    // Filter items by selected statuses if provided
    if (selectedStatuses.length > 0) {
      items = items.filter(item => {
        const status = orderStatusMap.get(item.order_id)
        return status && selectedStatuses.includes(status)
      })
    }

    // Fetch combo relationships
    const comboMap = await getComboRelationships()

    // Process size summary
    const sizeSummary = processSizeSummary(items, designs, comboMap)
    const sizeTotals = calculateSizeTotals(sizeSummary)

    // Prepare data for Excel
    const sizes = ALL_SIZES as readonly string[]

    const excelData = [
      ...sizeSummary,
      {
        'แบบเสื้อ': 'รวมทั้งหมด',
        ...Object.fromEntries(sizes.map(size => [size, sizeTotals[size] || 0]))
      }
    ]

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Design name column
      ...sizes.map(() => ({ wch: 10 })) // Size columns
    ]
    ws['!cols'] = colWidths

    // Format total row with background color (light blue)
    const totalRowIndex = excelData.length
    const cells = Object.keys(ws)
    cells.forEach(cell => {
      const match = cell.match(/^([A-Z]+)(\d+)$/)
      if (match && match[2] === totalRowIndex.toString()) {
        ws[cell].fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'E3F2FD' } }
        ws[cell].font = { bold: true }
      }
    })

    XLSX.utils.book_append_sheet(wb, ws, 'ขนาดเสื้อ')

    // Generate Excel buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Send response
    const timestamp = new Date().toISOString().split('T')[0]
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="size-summary_${timestamp}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error exporting size summary:', error)
    return NextResponse.json(
      { error: 'Failed to export size summary' },
      { status: 500 }
    )
  }
}
