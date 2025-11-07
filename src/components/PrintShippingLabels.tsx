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

  return (
    <div className="print-container">
      <style jsx global>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }

          @page {
            size: A4;
            margin: 1cm;
            margin-top: 0;
            margin-bottom: 0;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
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
        }

        @media screen {
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
        }
      `}</style>

      <div className="no-print mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-800 font-medium">
          กำลังเตรียมพิมพ์ {orders.length} รายการ
        </p>
        <p className="text-sm text-blue-600 mt-1">
          หน้าต่างพิมพ์จะเปิดโดยอัตโนมัติ หรือกด Ctrl+P เพื่อพิมพ์
        </p>
        <p className="text-xs text-blue-500 mt-2">
          💡 ในการตั้งค่าพิมพ์ ปิด &quot;ส่วนหัวและส่วนท้าย&quot; เพื่อให้ป้ายจัดส่งสะอาด
        </p>
      </div>

      {orders.map((order, index) => (
        <div
          key={order.id}
          className={`shipping-label border-2 border-gray-800 p-6 mb-4 ${
            index < orders.length - 1 ? 'page-break' : ''
          }`}
        >
          <div className="text-center mb-4 pb-4 border-b-2 border-gray-300" style={{ transform: 'scale(0.8)', transformOrigin: 'center top' }}>
            <h1 className="text-2xl font-bold">ใบปะหน้าพัสดุ</h1>
            <p className="text-lg mt-1">Tiger Thailand Meeting 2026</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-bold mb-3 bg-gray-200 p-2">
                ข้อมูลผู้รับ
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">ชื่อ:</span>
                  <p className="text-xl ml-2">{order.name}</p>
                </div>
                <div>
                  <span className="font-semibold">เบอร์โทร:</span>
                  <p className="text-xl ml-2">{order.phone || '-'}</p>
                </div>
                <div>
                  <span className="font-semibold">วิธีรับ:</span>
                  <p className="text-lg ml-2">
                    {order.is_pickup ? (
                      <span className="font-bold text-green-700">รับหน้างาน</span>
                    ) : (
                      <span className="font-bold text-blue-700">จัดส่ง</span>
                    )}
                  </p>
                </div>
                {!order.is_pickup && order.address && (
                  <div>
                    <span className="font-semibold">ที่อยู่จัดส่ง:</span>
                    <p className="text-base ml-2 mt-1 p-3 border border-gray-300 bg-gray-50 rounded">
                      {order.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-3 bg-gray-200 p-2">
                ข้อมูลคำสั่งซื้อ
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">เลขที่:</span>
                  <p className="text-2xl font-bold ml-2">#{order.id}</p>
                </div>
                <div>
                  <span className="font-semibold">วันที่สั่ง:</span>
                  <p className="ml-2">
                    {new Date(order.created_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">ยอดรวม:</span>
                  <p className="text-xl font-bold ml-2 text-green-700">
                    {order.total_price.toLocaleString()} บาท
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3 bg-gray-200 p-2">
              รายการสินค้า
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-2 border-gray-400">
                  <th className="border border-gray-400 p-2 text-left">แบบเสื้อ</th>
                  <th className="border border-gray-400 p-2 text-center">ขนาด</th>
                  <th className="border border-gray-400 p-2 text-center">จำนวน</th>
                  <th className="border border-gray-400 p-2 text-right">ราคา/ชิ้น</th>
                  <th className="border border-gray-400 p-2 text-right">รวม</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border border-gray-400">
                    <td className="border border-gray-400 p-2">
                      {getDesignName(item.design)}
                    </td>
                    <td className="border border-gray-400 p-2 text-center font-bold">
                      {item.size}
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {item.price_per_unit.toLocaleString()}
                    </td>
                    <td className="border border-gray-400 p-2 text-right font-semibold">
                      {(item.quantity * item.price_per_unit).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={4} className="border-2 border-gray-400 p-2 text-right">
                    ยอดรวมทั้งสิ้น:
                  </td>
                  <td className="border-2 border-gray-400 p-2 text-right text-lg">
                    {order.total_price.toLocaleString()} บาท
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-400">
            <p className="text-sm text-gray-600 text-center">
              ** กรุณาตรวจสอบสินค้าก่อนรับ หากมีปัญหาโปรดติดต่อทันที **
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
