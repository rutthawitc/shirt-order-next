'use client'

import { useState, useMemo } from 'react'
import SizeSummaryTable from '@/components/SizeSummaryTable'
import SizeSummaryStats from '@/components/SizeSummaryStats'
import SizeSummaryFilters from '@/components/SizeSummaryFilters'
import { processSizeSummary } from '@/lib/size-summary'
import type { SizeSummaryRow } from '@/lib/size-summary'
import type { DBOrderItem } from '@/types/order'
import type { ComboMap } from '@/lib/combo-products'

interface DesignInfo {
  id: string
  name: string
}

interface Order {
  id: number
  name: string
  phone: string
  address: string
  is_pickup: boolean
  total_price: number
  slip_image: string
  status: string
  created_at: string
}

interface SizeSummaryClientProps {
  initialData: SizeSummaryRow[]
  orders: Order[]
  allItems: DBOrderItem[]
  allDesigns: DesignInfo[]
  comboMap: ComboMap
}

/**
 * Client component for Size Summary admin page
 * Handles filtering, sorting, and real-time updates
 */
export default function SizeSummaryClient({
  initialData,
  orders,
  allItems,
  allDesigns,
  comboMap
}: SizeSummaryClientProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    'pending',
    'confirmed',
    'processing',
    'completed'
  ])
  const [sortBy, setSortBy] = useState<'name' | 'total'>('name')
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Create a map of order ID to status for quick lookup
  const orderStatusMap = useMemo(() => {
    return new Map(orders.map(order => [order.id, order.status]))
  }, [orders])

  // Filter items based on selected statuses
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (!item.order_id) return false
      const status = orderStatusMap.get(item.order_id)
      return status && selectedStatuses.includes(status)
    })
  }, [allItems, selectedStatuses, orderStatusMap])

  // Recalculate size summary based on filtered items
  const filteredSummary = useMemo(() => {
    return processSizeSummary(filteredItems, allDesigns, comboMap)
  }, [filteredItems, allDesigns, comboMap])

  // Apply sorting
  const sortedSummary = useMemo(() => {
    const sorted = [...filteredSummary]
    if (sortBy === 'name') {
      sorted.sort((a, b) => {
        const nameA = (a['แบบเสื้อ'] as string).toLowerCase()
        const nameB = (b['แบบเสื้อ'] as string).toLowerCase()
        return nameA.localeCompare(nameB, 'th')
      })
    } else if (sortBy === 'total') {
      sorted.sort((a, b) => {
        const totalA = calculateDesignTotal(a)
        const totalB = calculateDesignTotal(b)
        return totalB - totalA // Descending
      })
    }
    return sorted
  }, [filteredSummary, sortBy])

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      // Trigger a revalidation of the data
      // This is a client-side refresh simulation
      // In a real implementation, you'd call an API endpoint
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error refreshing data:', error)
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Build query parameters for the export endpoint
      const statusParam = selectedStatuses.length > 0 ? selectedStatuses.join(',') : ''
      const url = `/api/admin/size-summary/export${statusParam ? `?statuses=${statusParam}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to export')
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `size-summary_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('ไม่สามารถส่งออกไฟล์ได้')
    } finally {
      setIsExporting(false)
    }
  }

  const handleStatusChange = (statuses: string[]) => {
    setSelectedStatuses(statuses)
  }

  const handleSortChange = (newSort: 'name' | 'total') => {
    setSortBy(newSort)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">สรุปขนาดเสื้อ</h1>
        <p className="text-gray-600 mt-2">ดูจำนวนเสื้อแต่ละขนาดตามแบบ</p>
      </div>

      {/* Statistics Cards */}
      <SizeSummaryStats data={sortedSummary} />

      {/* Filters */}
      <SizeSummaryFilters
        selectedStatuses={selectedStatuses}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Size Summary Table */}
      <SizeSummaryTable data={sortedSummary} />
    </div>
  )
}

/**
 * Helper function to calculate total for a design row
 */
function calculateDesignTotal(row: SizeSummaryRow): number {
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']
  return sizes.reduce((sum, size) => {
    const value = row[size] as number
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
}
