// src/app/admin/size-summary/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { getComboRelationships } from '@/lib/combo-products'
import { processSizeSummary } from '@/lib/size-summary'
import SizeSummaryClient from '@/components/SizeSummaryClient'
import type { DBOrderItem } from '@/types/order'
import type { SizeSummaryRow } from '@/lib/size-summary'

export const dynamic = 'force-dynamic'

export default async function AdminSizeSummaryPage() {
  const cookieStore = await cookies()
  const isAuthenticated = (await cookieStore).has('admin_authenticated')

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  try {
    // Fetch all data required for size summary
    const [ordersResult, itemsResult, designsResult] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*'),
      supabase.from('shirt_designs').select('id, name')
    ])

    if (ordersResult.error) throw ordersResult.error
    if (itemsResult.error) throw itemsResult.error
    if (designsResult.error) throw designsResult.error

    const orders = ordersResult.data || []
    const items = (itemsResult.data || []) as DBOrderItem[]
    const designs = designsResult.data || []

    // Fetch combo relationships
    const comboMap = await getComboRelationships()

    // Process size summary
    const sizeSummary = processSizeSummary(items, designs, comboMap)

    return (
      <div className="container mx-auto py-8">
        <SizeSummaryClient
          initialData={sizeSummary}
          orders={orders}
          allItems={items}
          allDesigns={designs}
          comboMap={comboMap}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading size summary:', error)
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-red-800 font-semibold">ข้อผิดพลาด</h2>
          <p className="text-red-600 text-sm">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่</p>
        </div>
      </div>
    )
  }
}
