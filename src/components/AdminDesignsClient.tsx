'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { DBShirtDesign } from '@/types/order'
import Image from 'next/image'

export default function AdminDesignsClient() {
  const [designs, setDesigns] = useState<DBShirtDesign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDesign, setEditingDesign] = useState<DBShirtDesign | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    description: '',
    displayOrder: '',
    isActive: true
  })
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)

  useEffect(() => {
    fetchDesigns()
  }, [])

  const fetchDesigns = async () => {
    try {
      // Fetch all designs including inactive ones for admin
      const response = await fetch('/api/shirt-designs?includeInactive=true')
      if (!response.ok) throw new Error('Failed to fetch designs')
      const data = await response.json()
      setDesigns(data)
    } catch (error) {
      console.error('Error fetching designs:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลแบบเสื้อได้',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingDesign(null)
    setFormData({
      id: '',
      name: '',
      price: '',
      description: '',
      displayOrder: (designs.length + 1).toString(),
      isActive: true
    })
    setFrontImage(null)
    setBackImage(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (design: DBShirtDesign) => {
    setEditingDesign(design)
    setFormData({
      id: design.id,
      name: design.name,
      price: design.price.toString(),
      description: design.description,
      displayOrder: design.display_order.toString(),
      isActive: design.is_active
    })
    setFrontImage(null)
    setBackImage(null)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('price', formData.price)
      data.append('description', formData.description)
      data.append('displayOrder', formData.displayOrder)
      data.append('isActive', formData.isActive.toString())

      if (editingDesign) {
        // Update existing design
        if (frontImage) data.append('frontImage', frontImage)
        if (backImage) data.append('backImage', backImage)

        const response = await fetch(`/api/shirt-designs/${editingDesign.id}`, {
          method: 'PUT',
          body: data
        })

        if (!response.ok) throw new Error('Failed to update design')

        toast({
          title: 'สำเร็จ!',
          description: 'อัพเดทแบบเสื้อเรียบร้อยแล้ว'
        })
      } else {
        // Create new design
        if (!frontImage) {
          toast({
            title: 'ข้อผิดพลาด',
            description: 'กรุณาเลือกรูปภาพด้านหน้า',
            variant: 'destructive'
          })
          setIsSubmitting(false)
          return
        }

        data.append('id', formData.id)
        data.append('frontImage', frontImage)
        // Back image is optional
        if (backImage) {
          data.append('backImage', backImage)
        }

        const response = await fetch('/api/shirt-designs', {
          method: 'POST',
          body: data
        })

        if (!response.ok) throw new Error('Failed to create design')

        toast({
          title: 'สำเร็จ!',
          description: 'เพิ่มแบบเสื้อใหม่เรียบร้อยแล้ว'
        })
      }

      setIsDialogOpen(false)
      fetchDesigns()
    } catch (error) {
      console.error('Error saving design:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแบบเสื้อนี้?')) return

    try {
      const response = await fetch(`/api/shirt-designs/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete design')

      toast({
        title: 'สำเร็จ!',
        description: 'ลบแบบเสื้อเรียบร้อยแล้ว'
      })

      fetchDesigns()
    } catch (error) {
      console.error('Error deleting design:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบแบบเสื้อได้',
        variant: 'destructive'
      })
    }
  }

  const handleReactivate = async (id: string) => {
    if (!confirm('คุณต้องการเปิดใช้งานแบบเสื้อนี้อีกครั้งหรือไม่?')) return

    try {
      const formData = new FormData()
      formData.append('isActive', 'true')

      const response = await fetch(`/api/shirt-designs/${id}`, {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to reactivate design')

      toast({
        title: 'สำเร็จ!',
        description: 'เปิดใช้งานแบบเสื้ออีกครั้งเรียบร้อยแล้ว'
      })

      fetchDesigns()
    } catch (error) {
      console.error('Error reactivating design:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเปิดใช้งานแบบเสื้อได้',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">จัดการแบบเสื้อ</h1>
          <p className="text-gray-600 mt-2">เพิ่ม แก้ไข หรือลบแบบเสื้อที่จะขาย</p>
        </div>
        <Button onClick={openCreateDialog}>เพิ่มแบบเสื้อใหม่</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <Card key={design.id} className={!design.is_active ? 'opacity-60 border-red-300' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={!design.is_active ? 'text-gray-500' : ''}>{design.name}</CardTitle>
                {!design.is_active && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">ไม่ใช้งาน</span>
                )}
              </div>
              <CardDescription>฿{design.price.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">ด้านหน้า</p>
                  <div className="relative h-32 bg-gray-100 rounded">
                    {design.front_image ? (
                      <Image
                        src={design.front_image}
                        alt={`${design.name} - ด้านหน้า`}
                        fill
                        className="object-contain"
                        unoptimized
                        onError={(e) => {
                          console.error('Failed to load image:', design.front_image)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        ไม่มีรูปภาพ
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">ด้านหลัง</p>
                  <div className="relative h-32 bg-gray-100 rounded">
                    {design.back_image ? (
                      <Image
                        src={design.back_image}
                        alt={`${design.name} - ด้านหลัง`}
                        fill
                        className="object-contain"
                        unoptimized
                        onError={(e) => {
                          console.error('Failed to load image:', design.back_image)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        ไม่มีรูปภาพ
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{design.description}</p>
              <div className="flex gap-2">
                {design.is_active ? (
                  <>
                    <Button onClick={() => openEditDialog(design)} variant="outline" className="flex-1">
                      แก้ไข
                    </Button>
                    <Button onClick={() => handleDelete(design.id)} variant="destructive" className="flex-1">
                      ลบ
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleReactivate(design.id)} variant="outline" className="flex-1">
                    เปิดใช้งานอีกครั้ง
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDesign ? 'แก้ไขแบบเสื้อ' : 'เพิ่มแบบเสื้อใหม่'}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลและอัพโหลดรูปภาพแบบเสื้อ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!editingDesign && (
                <div>
                  <label className="block text-sm font-medium mb-2">รหัสแบบ</label>
                  <Input
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="เช่น 5, 6, 7..."
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">ชื่อแบบเสื้อ</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="แบบที่ 5 เสื้อ..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="750"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">คำอธิบาย</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="เสื้อเจอร์ซีย์..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ลำดับการแสดง</label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  placeholder="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  รูปภาพด้านหน้า {editingDesign && '(เลือกเฉพาะเมื่อต้องการเปลี่ยน)'}
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                  required={!editingDesign}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  รูปภาพด้านหลัง (ไม่บังคับ) {editingDesign && '- เลือกเฉพาะเมื่อต้องการเปลี่ยน'}
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
