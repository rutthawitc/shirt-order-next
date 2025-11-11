'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShirtIcon, TrendingUpIcon, BarChartIcon } from 'lucide-react'
import {
  calculateGrandTotal,
  getMostPopularDesign,
  getMostPopularSize
} from '@/lib/size-summary'
import type { SizeSummaryRow } from '@/lib/size-summary'

interface SizeSummaryStatsProps {
  data: SizeSummaryRow[]
}

/**
 * Display summary statistics for size summary data
 * Shows: Total shirts, Most popular design, Most popular size
 */
export default function SizeSummaryStats({ data }: SizeSummaryStatsProps) {
  const grandTotal = calculateGrandTotal(data)
  const mostPopularDesign = getMostPopularDesign(data)
  const mostPopularSize = getMostPopularSize(data)

  const stats = [
    {
      title: 'เสื้อทั้งหมด',
      value: grandTotal.toString(),
      icon: ShirtIcon,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'แบบเสื้อที่นิยมสุด',
      value: mostPopularDesign || '-',
      icon: TrendingUpIcon,
      color: 'bg-green-50 text-green-700'
    },
    {
      title: 'ขนาดที่นิยมสุด',
      value: mostPopularSize || '-',
      icon: BarChartIcon,
      color: 'bg-purple-50 text-purple-700'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={stat.color}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <Icon className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
