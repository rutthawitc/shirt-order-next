'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw, Filter, SortAsc, Download } from 'lucide-react'
import { useState } from 'react'

interface SizeSummaryFiltersProps {
  selectedStatuses: string[]
  onStatusChange: (statuses: string[]) => void
  sortBy: 'name' | 'total'
  onSortChange: (sort: 'name' | 'total') => void
  onRefresh: () => void
  isLoading: boolean
  onExport?: () => void
  isExporting?: boolean
}

/**
 * Filters and sorting controls for size summary
 * Allows filtering by order status and sorting options
 */
export default function SizeSummaryFilters({
  selectedStatuses,
  onStatusChange,
  sortBy,
  onSortChange,
  onRefresh,
  isLoading,
  onExport,
  isExporting = false
}: SizeSummaryFiltersProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const statusOptions = [
    { value: 'pending', label: 'รอตรวจสอบ' },
    { value: 'confirmed', label: 'ยืนยันการชำระเงิน' },
    { value: 'processing', label: 'กำลังจัดส่ง' },
    { value: 'completed', label: 'จัดส่งแล้ว' },
    { value: 'cancelled', label: 'ยกเลิก' }
  ]

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status]

    onStatusChange(newStatuses)
  }

  const handleSelectAll = () => {
    if (selectedStatuses.length === statusOptions.length) {
      onStatusChange([])
    } else {
      onStatusChange(statusOptions.map(opt => opt.value))
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Filter */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">สถานะออเดอร์</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatuses.length === statusOptions.length ? 'default' : 'outline'}
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              ทั้งหมด
            </Button>
            {statusOptions.map(option => (
              <Button
                key={option.value}
                variant={selectedStatuses.includes(option.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusToggle(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort and Refresh Controls */}
        <div className="flex items-center gap-2 md:justify-end">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-md bg-gray-50">
            <span className="text-xs text-gray-600 px-2 py-1">
              <SortAsc className="w-3 h-3 inline mr-1" />
              เรียง:
            </span>
            <button
              onClick={() => onSortChange('name')}
              className={`px-3 py-1 text-xs transition-colors ${
                sortBy === 'name'
                  ? 'bg-white text-blue-600 font-medium border-r'
                  : 'text-gray-600 hover:bg-white'
              }`}
            >
              ชื่อ
            </button>
            <button
              onClick={() => onSortChange('total')}
              className={`px-3 py-1 text-xs transition-colors ${
                sortBy === 'total'
                  ? 'bg-white text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-white'
              }`}
            >
              จำนวน
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>

          {/* Export Button */}
          {onExport && (
            <Button
              onClick={onExport}
              disabled={isExporting}
              variant="default"
              size="sm"
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">ส่งออก</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Indicator */}
      {selectedStatuses.length > 0 && selectedStatuses.length < statusOptions.length && (
        <div className="text-xs text-gray-600 border-t pt-3">
          กำลังแสดง {selectedStatuses.length} สถานะ
        </div>
      )}
    </div>
  )
}
