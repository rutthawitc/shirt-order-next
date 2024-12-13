// src/components/AdminOrderTable.tsx
'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, FileImage, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Order } from '@/types/order'

interface AdminOrderTableProps {
  orders: Order[]
  onViewSlip: (order: Order) => void
  onViewDetails: (order: Order) => void
  onUpdateStatus: () => void
}

export default function AdminOrderTable({ 
  orders, 
  onViewSlip, 
  onViewDetails,
  onUpdateStatus
}: AdminOrderTableProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateStatus = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowConfirmDialog(true)
  }

  const confirmUpdateStatus = async () => {
    if (!selectedOrderId) return
  
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrderId}/status`, {  // path ถูกต้องแล้ว
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'delivered'
        })
      })
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Response:', text); // debug
        throw new Error('Failed to update order status');
      }
  
      const data = await response.json();
  
      toast({
        title: "อัพเดทสถานะสำเร็จ",
        description: data.message || "สถานะออเดอร์ถูกอัพเดทเป็น 'จัดส่งแล้ว'",
      })
  
      setShowConfirmDialog(false)
      onUpdateStatus()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสถานะได้",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสสั่งซื้อ</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>ชื่อผู้สั่ง</TableHead>
              <TableHead>ที่อยู่/วิธีรับ</TableHead>
              <TableHead className="text-right">ยอดรวม</TableHead>
              <TableHead>สลิป</TableHead>
              <TableHead>จัดการ</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleString('th-TH')}
                </TableCell>
                <TableCell>{order.name}</TableCell>
                <TableCell>
                  {order.is_pickup ? 'รับหน้างาน' : order.address}
                </TableCell>
                <TableCell className="text-right">
                  {order.total_price.toLocaleString()} บาท
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewSlip(order)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <FileImage className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(order)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  {order.status === 'pending' ? (
                    <Button
                      onClick={() => handleUpdateStatus(order.id)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      เสร็จสิ้น
                    </Button>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Check className="mr-1 h-4 w-4" />
                      จัดส่งแล้ว
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการเปลี่ยนสถานะ</DialogTitle>
            <DialogDescription>
              คุณต้องการเปลี่ยนสถานะออเดอร์ #{selectedOrderId} เป็น จัดส่งแล้ว ใช่หรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isUpdating}
            >
              ยกเลิก
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={confirmUpdateStatus}
              disabled={isUpdating}
            >
              {isUpdating ? 'กำลังอัพเดท...' : 'ยืนยัน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}