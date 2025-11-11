'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SizeSummaryRow } from '@/lib/size-summary'

interface SizeSummaryTableProps {
  data: SizeSummaryRow[]
}

/**
 * Size Summary Table Component
 * Displays shirt quantities by design and size
 * Includes a totals row at the bottom
 */
export default function SizeSummaryTable({ data }: SizeSummaryTableProps) {
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']

  // Calculate totals for each size
  const totals = calculateTotals(data, sizes)
  const grandTotal = Object.values(totals).reduce((sum, total) => sum + total, 0)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10">
                แบบเสื้อ
              </TableHead>
              {sizes.map(size => (
                <TableHead
                  key={size}
                  className="text-center font-semibold text-gray-900 bg-gray-50 w-12"
                >
                  {size}
                </TableHead>
              ))}
              <TableHead className="text-center font-semibold text-gray-900 bg-gray-50 w-16">
                รวม
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={sizes.length + 2} className="text-center text-gray-500 py-8">
                  ไม่มีข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              <>
                {data.map((row, index) => (
                  <TableRow
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <TableCell className="font-medium text-gray-900 bg-inherit sticky left-0 z-10">
                      {row['แบบเสื้อ']}
                    </TableCell>
                    {sizes.map(size => (
                      <TableCell
                        key={size}
                        className="text-center text-gray-700 w-12"
                      >
                        {row[size] || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-semibold text-gray-900 w-16">
                      {calculateRowTotal(row, sizes)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow className="bg-blue-50 border-t-2 border-gray-200 font-semibold">
                  <TableCell className="font-semibold text-gray-900 bg-blue-50 sticky left-0 z-10">
                    รวมทั้งหมด
                  </TableCell>
                  {sizes.map(size => (
                    <TableCell
                      key={size}
                      className="text-center text-gray-900 bg-blue-50 w-12"
                    >
                      {totals[size]}
                    </TableCell>
                  ))}
                  <TableCell className="text-center text-gray-900 bg-blue-50 w-16">
                    {grandTotal}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/**
 * Calculate the total for a single row
 */
function calculateRowTotal(row: SizeSummaryRow, sizes: string[]): number {
  return sizes.reduce((sum, size) => {
    const value = row[size] as number
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
}

/**
 * Calculate totals for each size across all rows
 */
function calculateTotals(data: SizeSummaryRow[], sizes: string[]): { [key: string]: number } {
  const totals: { [key: string]: number } = {}

  sizes.forEach(size => {
    totals[size] = data.reduce((sum, row) => {
      const value = row[size] as number
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
  })

  return totals
}
