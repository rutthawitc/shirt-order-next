'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Package } from 'lucide-react'

interface ComboComponent {
  id: number
  componentId: string
  componentName: string
  multiplier: number
}

interface ComboData {
  comboId: string
  comboName: string
  isCombo: boolean
  components: ComboComponent[]
}

interface ShirtDesign {
  id: string
  name: string
  is_combo?: boolean
}

interface ComponentFormData {
  componentId: string
  multiplier: number
}

export default function AdminCombosClient() {
  const [combos, setCombos] = useState<ComboData[]>([])
  const [designs, setDesigns] = useState<ShirtDesign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [selectedComboId, setSelectedComboId] = useState<string>('')
  const [components, setComponents] = useState<ComponentFormData[]>([
    { componentId: '', multiplier: 1 }
  ])

  const fetchCombos = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/combos')
      if (!response.ok) throw new Error('Failed to fetch combos')
      const data = await response.json()
      setCombos(data.combos || [])
      setDesigns(data.designs || [])
    } catch (error) {
      console.error('Error fetching combos:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูล Combo Products ได้',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchCombos()
  }, [fetchCombos])

  const openCreateDialog = () => {
    setSelectedComboId('')
    setComponents([{ componentId: '', multiplier: 1 }])
    setIsDialogOpen(true)
  }

  const openEditDialog = (combo: ComboData) => {
    setSelectedComboId(combo.comboId)
    setComponents(combo.components.map(c => ({
      componentId: c.componentId,
      multiplier: c.multiplier
    })))
    setIsDialogOpen(true)
  }

  const addComponent = () => {
    setComponents([...components, { componentId: '', multiplier: 1 }])
  }

  const removeComponent = (index: number) => {
    if (components.length === 1) {
      toast({
        title: 'ไม่สามารถลบได้',
        description: 'Combo ต้องมีอย่างน้อย 1 คอมโพเนนต์',
        variant: 'destructive'
      })
      return
    }
    setComponents(components.filter((_, i) => i !== index))
  }

  const updateComponent = (index: number, field: 'componentId' | 'multiplier', value: string | number) => {
    const newComponents = [...components]
    newComponents[index] = {
      ...newComponents[index],
      [field]: value
    }
    setComponents(newComponents)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validation
      if (!selectedComboId) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'กรุณาเลือกแบบเสื้อสำหรับ Combo',
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }

      // Check for empty components
      const hasEmptyComponents = components.some(c => !c.componentId || c.multiplier <= 0)
      if (hasEmptyComponents) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'กรุณากรอกข้อมูลคอมโพเนนต์ให้ครบถ้วน',
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }

      // Check for duplicate components
      const componentIds = components.map(c => c.componentId)
      const hasDuplicates = componentIds.length !== new Set(componentIds).size
      if (hasDuplicates) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถเลือกแบบเสื้อเดียวกันซ้ำได้',
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }

      // Check if combo includes itself
      if (componentIds.includes(selectedComboId)) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'Combo ไม่สามารถมีตัวเองเป็นคอมโพเนนต์ได้',
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/admin/combos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comboId: selectedComboId,
          components: components
        })
      })

      if (!response.ok) throw new Error('Failed to save combo')

      toast({
        title: 'สำเร็จ!',
        description: 'บันทึก Combo Product เรียบร้อยแล้ว'
      })

      setIsDialogOpen(false)
      // Verify with fresh data in background (no await, don't block UI)
      fetchCombos()
    } catch (error) {
      console.error('Error saving combo:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (comboId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Combo นี้? แบบเสื้อจะยังอยู่ แต่จะไม่ถูกแยกเป็นคอมโพเนนต์อีกต่อไป')) return

    try {
      const response = await fetch(`/api/admin/combos?comboId=${comboId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete combo')

      toast({
        title: 'สำเร็จ!',
        description: 'ลบ Combo เรียบร้อยแล้ว'
      })

      // Verify with fresh data in background (no await, don't block UI)
      fetchCombos()
    } catch (error) {
      console.error('Error deleting combo:', error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบ Combo ได้',
        variant: 'destructive'
      })
    }
  }

  // Get available designs for combo selection (non-combo designs only for components)
  const getAvailableDesignsForCombo = () => {
    return designs.filter(d => !d.is_combo || d.id === selectedComboId)
  }

  const getAvailableComponentDesigns = () => {
    return designs.filter(d => !d.is_combo)
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
          <h1 className="text-3xl font-bold">จัดการ Combo Products</h1>
          <p className="text-gray-600 mt-2">
            สร้างและจัดการแพ็คเกจเสื้อแบบรวม เมื่อลูกค้าสั่ง Combo ระบบจะแยกเป็นคอมโพเนนต์อัตโนมัติในรายงาน
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่ม Combo ใหม่
        </Button>
      </div>

      {combos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">ยังไม่มี Combo Products</p>
            <p className="text-sm text-gray-500 mt-1">คลิก &quot;เพิ่ม Combo ใหม่&quot; เพื่อเริ่มต้น</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => (
            <Card key={combo.comboId} className="border-2 border-blue-100">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  {combo.comboName}
                </CardTitle>
                <CardDescription>รหัส: {combo.comboId}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-medium text-gray-700">ประกอบด้วย:</p>
                  {combo.components.map((comp, index) => (
                    <div key={comp.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium text-blue-600">{comp.multiplier}x</span>
                      <span className="text-gray-700">{comp.componentName}</span>
                      <span className="text-gray-400 text-xs">({comp.componentId})</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => openEditDialog(combo)} variant="outline" className="flex-1">
                    แก้ไข
                  </Button>
                  <Button onClick={() => handleDelete(combo.comboId)} variant="destructive" className="flex-1">
                    ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedComboId ? 'แก้ไข Combo Product' : 'เพิ่ม Combo Product ใหม่'}
            </DialogTitle>
            <DialogDescription>
              เลือกแบบเสื้อที่จะเป็น Combo และกำหนดคอมโพเนนต์ที่จะแยกออกมา
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  แบบเสื้อสำหรับ Combo
                </label>
                <Select
                  value={selectedComboId}
                  onValueChange={setSelectedComboId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกแบบเสื้อ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableDesignsForCombo().map((design) => (
                      <SelectItem key={design.id} value={design.id}>
                        {design.name} (รหัส: {design.id})
                        {design.is_combo && design.id === selectedComboId && ' - กำลังแก้ไข'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  เลือกแบบเสื้อที่ต้องการตั้งเป็น Combo (จะถูกแยกเป็นคอมโพเนนต์ในรายงาน)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">คอมโพเนนต์</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addComponent}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    เพิ่มคอมโพเนนต์
                  </Button>
                </div>

                <div className="space-y-3">
                  {components.map((component, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Select
                          value={component.componentId}
                          onValueChange={(value) => updateComponent(index, 'componentId', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกแบบเสื้อ..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableComponentDesigns().map((design) => (
                              <SelectItem key={design.id} value={design.id}>
                                {design.name} (รหัส: {design.id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          value={component.multiplier}
                          onChange={(e) => updateComponent(index, 'multiplier', parseInt(e.target.value) || 1)}
                          placeholder="จำนวน"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComponent(index)}
                        disabled={components.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ตัวอย่าง: หากเลือกแบบเสื้อ A จำนวน 2 และแบบเสื้อ B จำนวน 1
                  เมื่อลูกค้าสั่ง Combo 1 ชุด ในรายงานจะแสดงเป็น แบบเสื้อ A 2 ตัว + แบบเสื้อ B 1 ตัว
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">ตัวอย่าง Preview:</p>
                {selectedComboId && components.filter(c => c.componentId).length > 0 ? (
                  <div className="text-sm text-blue-800">
                    <p className="mb-1">
                      <strong>{designs.find(d => d.id === selectedComboId)?.name || 'Combo'}</strong> ประกอบด้วย:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {components.filter(c => c.componentId).map((comp, index) => (
                        <li key={index}>
                          {comp.multiplier}x {designs.find(d => d.id === comp.componentId)?.name || 'Unknown'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">กรุณาเลือกแบบเสื้อและคอมโพเนนต์</p>
                )}
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
