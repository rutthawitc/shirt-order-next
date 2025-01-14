// src/components/AdminDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Lock, Unlock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import AdminOrderTable from '@/components/AdminOrderTable'
import type { Order } from '@/types/order'
import Image from 'next/image'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showSlipDialog, setShowSlipDialog] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [ordersClosed, setOrdersClosed] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchOrderStatus()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch('/api/orders/toggle-status')
      if (!response.ok) throw new Error('Failed to fetch order status')
      const data = await response.json()
      setOrdersClosed(data.ordersClosed)
    } catch (error) {
      console.error('Error fetching order status:', error)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/orders/export')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const handleToggleOrders = async () => {
    try {
      const response = await fetch('/api/orders/toggle-status', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to toggle order status')
      const data = await response.json()
      setOrdersClosed(data.ordersClosed)
    } catch (error) {
      console.error('Error toggling order status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>รายการสั่งซื้อทั้งหมด</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchOrders()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            รีเฟรช
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            ส่งออกข้อมูล
          </Button>
          <Button
            onClick={handleToggleOrders}
            variant={ordersClosed ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {ordersClosed ? (
              <>
                <Lock className="h-4 w-4" />
                เปิดรับออเดอร์
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                ปิดรับออเดอร์
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AdminOrderTable 
          orders={orders}
          onViewSlip={(order) => {
            setSelectedOrder(order)
            setShowSlipDialog(true)
          }}
          onViewDetails={(order) => {
            setSelectedOrder(order)
            setShowOrderDialog(true)
          }}
          onUpdateStatus={fetchOrders}
        />
      </CardContent>

      {/* Slip Dialog */}
      <Dialog open={showSlipDialog} onOpenChange={setShowSlipDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>สลิปการโอนเงิน</DialogTitle>
            <DialogDescription>
              ภาพสลิปการโอนเงินจากลูกค้า
            </DialogDescription>
          </DialogHeader>
          {selectedOrder?.slip_image && (
            <div className="relative w-full h-[400px]">
              <Image
                src={selectedOrder.slip_image}
                alt="สลิปการโอนเงิน"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>รายละเอียดคำสั่งซื้อ #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">ข้อมูลผู้สั่ง</h3>
                  <p>ชื่อ: {selectedOrder.name}</p>
                  <p>วิธีรับสินค้า: {selectedOrder.is_pickup ? 'รับหน้างาน' : 'จัดส่ง'}</p>
                  {!selectedOrder.is_pickup && <p>ที่อยู่: {selectedOrder.address}</p>}
                </div>
                <div>
                  <h3 className="font-semibold">ข้อมูลการสั่งซื้อ</h3>
                  <p>วันที่: {new Date(selectedOrder.created_at).toLocaleString('th-TH')}</p>
                  <p>ยอดรวม: {selectedOrder.total_price.toLocaleString()} บาท</p>
                  <p>สถานะ: {selectedOrder.status === 'pending' ? 'รอดำเนินการ' : 'จัดส่งแล้ว'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">รายการสินค้า</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">สินค้า</th>
                        <th className="text-left p-2">ขนาด</th>
                        <th className="text-center p-2">จำนวน</th>
                        <th className="text-right p-2">ราคาต่อชิ้น</th>
                        <th className="text-right p-2">รวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{getDesignName(item.design)}</td>
                          <td className="p-2">{item.size}</td>
                          <td className="text-center p-2">{item.quantity}</td>
                          <td className="text-right p-2">
                            {item.price_per_unit.toLocaleString()}
                          </td>
                          <td className="text-right p-2">
                            {(item.price_per_unit * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function getDesignName(designId: string): string {
  return {
    '1': 'แบบที่ 1 เสื้อใส่เข้างาน แขนยาว',
    '2': 'แบบที่ 2 เสื้อใส่เข้างาน แขนสั้น',
    '3': 'แบบที่ 3 เสื้อแพคคู่',
    '4': 'แบบที่ 4 เสื้อที่ระลึก'
  }[designId] || 'ไม่ระบุ'
}