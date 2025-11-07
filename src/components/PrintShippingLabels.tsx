'use client'

import { useEffect, useState } from 'react'
import type { Order } from '@/types/order'

export default function PrintShippingLabels() {
  const [orders, setOrders] = useState<Order[]>([])
  const [designs, setDesigns] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    // Get orders from sessionStorage
    const storedOrders = sessionStorage.getItem('printOrders')
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }

    // Fetch design names from database
    fetchDesigns()
  }, [])

  const fetchDesigns = async () => {
    try {
      const response = await fetch('/api/shirt-designs')
      if (!response.ok) throw new Error('Failed to fetch designs')
      const data = await response.json()
      setDesigns(data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })))
    } catch (error) {
      console.error('Error fetching designs:', error)
    }
  }

  const getDesignName = (designId: string): string => {
    const design = designs.find(d => d.id === designId)
    return design?.name || 'ไม่ระบุ'
  }

  // Auto-print when loaded
  useEffect(() => {
    if (orders.length > 0 && designs.length > 0) {
      // Small delay to ensure all content is rendered
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [orders, designs])

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  // Group orders into pages of 3
  const groupedOrders: Order[][] = []
  for (let i = 0; i < orders.length; i += 3) {
    groupedOrders.push(orders.slice(i, i + 3))
  }

  return (
    <div className="print-container">
      <style jsx global>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }

          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide navigation and non-printable elements */
          nav {
            display: none !important;
          }

          .no-print {
            display: none !important;
          }

          .page-break {
            page-break-after: always;
          }

          .print-container {
            width: 100%;
            margin: 0;
            padding: 0;
          }

          .label-page {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 277mm; /* A4 height minus margins */
          }

          .shipping-label {
            height: 92mm; /* Approximately 1/3 of A4 */
            border: 2px solid #000;
            padding: 8px;
            margin-bottom: 2mm;
            page-break-inside: avoid;
          }

          .shipping-label:last-child {
            margin-bottom: 0;
          }
        }

        @media screen {
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }

          .label-page {
            margin-bottom: 20px;
          }

          .shipping-label {
            border: 2px solid #000;
            padding: 12px;
            margin-bottom: 10px;
          }
        }
      `}</style>

      <div className="no-print mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-800 font-medium">
          กำลังเตรียมพิมพ์ {orders.length} รายการ ({groupedOrders.length} หน้า, 3 ป้ายต่อหน้า)
        </p>
        <p className="text-sm text-blue-600 mt-1">
          หน้าต่างพิมพ์จะเปิดโดยอัตโนมัติ หรือกด Ctrl+P เพื่อพิมพ์
        </p>
        <p className="text-xs text-blue-500 mt-2">
          💡 ในการตั้งค่าพิมพ์ ปิด &quot;ส่วนหัวและส่วนท้าย&quot; เพื่อให้ป้ายจัดส่งสะอาด
        </p>
      </div>

      {groupedOrders.map((pageOrders, pageIndex) => (
        <div
          key={`page-${pageIndex}`}
          className={`label-page ${pageIndex < groupedOrders.length - 1 ? 'page-break' : ''}`}
        >
          {pageOrders.map((order) => (
            <div key={order.id} className="shipping-label">
              {/* Header */}
              <div className="text-center mb-2 pb-2 border-b border-gray-400">
                <h1 className="text-sm font-bold">ใบปะหน้าพัสดุ - Tiger Thailand Meeting 2026</h1>
              </div>

              {/* Main Content - Single Column for compact layout */}
              <div className="space-y-2 text-xs">
                {/* Order Number */}
                <div className="flex items-center justify-between bg-gray-100 p-1">
                  <span className="font-semibold">เลขที่:</span>
                  <span className="text-lg font-bold">#{order.id}</span>
                </div>

                {/* Recipient Info */}
                <div className="border border-gray-300 p-2">
                  <div className="font-bold mb-1">ผู้รับ:</div>
                  <div className="ml-2 space-y-1">
                    <div><span className="font-semibold">ชื่อ:</span> {order.name}</div>
                    <div><span className="font-semibold">เบอร์:</span> {order.phone || '-'}</div>
                    <div>
                      <span className="font-semibold">วิธีรับ:</span>{' '}
                      {order.is_pickup ? (
                        <span className="font-bold text-green-700">รับหน้างาน</span>
                      ) : (
                        <span className="font-bold text-blue-700">จัดส่ง</span>
                      )}
                    </div>
                    {!order.is_pickup && order.address && (
                      <div className="mt-1 p-1 bg-yellow-50 border border-yellow-200">
                        <div className="font-semibold">ที่อยู่:</div>
                        <div className="text-xs">{order.address}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items - Compact Table */}
                <div className="border border-gray-300">
                  <div className="bg-gray-100 p-1 font-bold text-xs">รายการสินค้า</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-1 text-left text-xs">แบบ</th>
                        <th className="border border-gray-300 p-1 text-center text-xs">ไซส์</th>
                        <th className="border border-gray-300 p-1 text-center text-xs">จำนวน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-300 p-1 text-xs">
                            {getDesignName(item.design).replace('เสื้อใส่เข้างาน', '').trim()}
                          </td>
                          <td className="border border-gray-300 p-1 text-center font-bold">
                            {item.size}
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total and Date */}
                <div className="flex justify-between items-center bg-gray-100 p-1">
                  <div className="text-xs">
                    {new Date(order.created_at).toLocaleDateString('th-TH', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })}
                  </div>
                  <div className="font-bold text-green-700">
                    รวม: {order.total_price.toLocaleString()} บาท
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-1 pt-1 border-t border-dashed border-gray-300">
                <p className="text-xs text-gray-600 text-center">
                  ** ตรวจสอบสินค้าก่อนรับ **
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
