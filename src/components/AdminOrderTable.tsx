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
import { Eye, FileImage } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Order } from '@/types/order'
import { updateOrderStatus } from '@/app/actions/orders'

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
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const { toast } = useToast()

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอตรวจสอบ'
      case 'confirmed':
        return 'ยืนยันการชำระเงิน'
      case 'processing':
        return 'กำลังจัดส่ง'
      case 'completed':
        return 'จัดส่งแล้ว'
      case 'cancelled':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId)
      setIsUpdating(true)

      console.log('Updating status:', { orderId, newStatus })

      const result = await updateOrderStatus(orderId, newStatus)

      if (!result.success) {
        console.error('Update failed:', result.error)
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาด",
          description: result.error
        })
        return
      }

      toast({
        title: "สถานะอัพเดทเรียบร้อย",
        description: `อัพเดทสถานะเป็น ${getStatusLabel(newStatus)} สำเร็จ`
      })
      onUpdateStatus()
    } catch (error) {
      console.error('Error in handleStatusChange:', error)
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสถานะได้ กรุณาลองใหม่อีกครั้ง"
      })
    } finally {
      setIsUpdating(false)
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เลขที่คำสั่งซื้อ</TableHead>
            <TableHead>ชื่อ</TableHead>
            <TableHead>ราคารวม</TableHead>
            <TableHead>วันที่สั่งซื้อ</TableHead>
            <TableHead>สลิป</TableHead>
            <TableHead>รายละเอียด</TableHead>
            <TableHead>สถานะ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.name}</TableCell>
              <TableCell>{order.total_price.toLocaleString()} บาท</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString('th-TH')}</TableCell>
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
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                  disabled={isUpdating && updatingOrderId === order.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="เลือกสถานะ">
                      {getStatusLabel(order.status)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">รอตรวจสอบ</SelectItem>
                    <SelectItem value="confirmed">ยืนยันการชำระเงิน</SelectItem>
                    <SelectItem value="processing">กำลังจัดส่ง</SelectItem>
                    <SelectItem value="completed">จัดส่งแล้ว</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}