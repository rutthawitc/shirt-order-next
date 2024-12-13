// src/components/ShirtOrderForm.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Upload, Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SHIRT_DESIGNS, SIZES } from "@/constants/shirt-designs";
import SizeGuideCard from "@/components/SizeGuideCard";
import SouvenirSizeGuideCard from "@/components/SouvenirSizeGuideCard";
import type { OrderItem, DBOrderItem, CustomerInfo } from "@/types/order";
import ShirtDesignCard from "@/components/ShirtDesignCard";
import { createObjectURL, revokeObjectURL } from "@/lib/image-helpers";

export default function ShirtOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const initialPrice = SHIRT_DESIGNS.find((d) => d.id === "1")?.price || 750;

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      design: "1",
      size: "M",
      quantity: 1,
      price_per_unit: initialPrice,
    },
  ]);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    address: "",
    slipImage: null,
    isPickup: false,
  });

  const calculateTotalPrice = (): number => {
    return orderItems.reduce((total, item) => {
      const design = SHIRT_DESIGNS.find((d) => d.id === item.design);
      return total + (design?.price ?? 0) * item.quantity;
    }, 0);
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Update price_per_unit when design changes
    if (field === "design") {
      const design = SHIRT_DESIGNS.find((d) => d.id === value);
      newItems[index].price_per_unit = design?.price || 750;
    }

    setOrderItems(newItems);
  };

  const addItem = () => {
    setOrderItems([
      ...orderItems,
      {
        design: "1",
        size: "M",
        quantity: 1,
        price_per_unit: initialPrice,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (orderItems.length > 1) {
      const newItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newItems);
    }
  };

  const handleCustomerInfoChange = (
    field: keyof CustomerInfo,
    value: string | File | null | boolean
  ) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCustomerInfoChange("slipImage", file);
      // Create and store the preview URL
      const previewUrl = createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  // Clean up the preview URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (previewImage) {
        revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const validateForm = (): boolean => {
    if (orderItems.length === 0) {
      setError("กรุณาเพิ่มรายการสั่งซื้ออย่างน้อย 1 รายการ");
      return false;
    }
    if (!customerInfo.name.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return false;
    }
    if (!customerInfo.isPickup && !customerInfo.address.trim()) {
      setError("กรุณากรอกที่อยู่จัดส่ง");
      return false;
    }
    if (!customerInfo.slipImage) {
      setError("กรุณาอัพโหลดสลิปการโอนเงิน");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      // Convert OrderItems to DBOrderItems before sending
      const itemsForSubmission: DBOrderItem[] = orderItems.map((item) => ({
        design: item.design,
        size: item.size,
        quantity: item.quantity,
        price_per_unit:
          item.price_per_unit ||
          SHIRT_DESIGNS.find((d) => d.id === item.design)?.price ||
          750,
      }));

      const formData = new FormData();
      formData.append("name", customerInfo.name);
      formData.append("address", customerInfo.address);
      formData.append("isPickup", customerInfo.isPickup.toString());
      formData.append("items", JSON.stringify(itemsForSubmission));
      formData.append("totalPrice", calculateTotalPrice().toString());

      if (customerInfo.slipImage) {
        formData.append("slipImage", customerInfo.slipImage);
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ");
      }

      setShowSuccess(true);

      // Reset form
      setOrderItems([
        {
          design: "1",
          size: "M",
          quantity: 1,
          price_per_unit: initialPrice,
        },
      ]);

      setCustomerInfo({
        name: "",
        address: "",
        slipImage: null,
        isPickup: false,
      });

      setPreviewImage(null);
    } catch (error) {
      console.error("Order submission error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          ระบบสั่งจองเสื้อ
        </h1>
        <h2 className="text-xl font-semibold text-gray-700">
          Tiger Thailand Meeting 2025
        </h2>
        <div className="space-y-2">
          <p className="text-red-600 font-medium">
            ** เสื้อสำหรับใส่เข้างาน คือ แบบที่ 1 และ แบบที่ 2 เท่านั้น **
          </p>
          <p className="text-orange-600 font-medium">
            ** สั่งได้ตั้งแต่วันนี้ จนถึง 10 มกราคม 2568 **
          </p>
        </div>
        <p className="text-gray-600">เลือกแบบและขนาดตามที่ต้องการ</p>
      </div>

      {/* Rest of the form */}
      <Card>
        <CardHeader>
          <CardTitle>สั่งจองเสื้อ</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Design Showcase */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                แบบเสื้อที่มีให้เลือก
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SHIRT_DESIGNS.map((design) => (
                  <ShirtDesignCard key={design.id} design={design} />
                ))}
              </div>
            </div>

            {/* Size Guides */}
            <SizeGuideCard />
            <SouvenirSizeGuideCard />

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">รายการสั่งซื้อ</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มรายการ
                </Button>
              </div>

              {orderItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">รายการที่ {index + 1}</h4>
                      {orderItems.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-2">แบบเสื้อ</label>
                        <Select
                          value={item.design}
                          onValueChange={(value) =>
                            handleItemChange(index, "design", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกแบบเสื้อ" />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIRT_DESIGNS.map((design) => (
                              <SelectItem key={design.id} value={design.id}>
                                {design.name} - {design.price.toLocaleString()}{" "}
                                บาท
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block mb-2">ขนาด</label>
                        <Select
                          value={item.size}
                          onValueChange={(value) =>
                            handleItemChange(index, "size", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกขนาด" />
                          </SelectTrigger>
                          <SelectContent>
                            {SIZES.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block mb-2">จำนวน</label>
                        <Select
                          value={item.quantity.toString()}
                          onValueChange={(value) =>
                            handleItemChange(index, "quantity", parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกจำนวน" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Total Price */}
            <div className="text-right space-y-2">
              <div className="text-sm text-red-500 font-semibold">
                ฟรีค่าจัดส่ง
              </div>
              <div className="text-xl font-semibold">
                ราคารวมทั้งสิ้น: {calculateTotalPrice().toLocaleString()} บาท
              </div>
            </div>

            {/* Bank Account Info */}
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="font-semibold mb-2">ข้อมูลบัญชีสำหรับโอนเงิน</p>
              <p>ชื่อบัญชี: นายกิตติพิชญ์ อึงสถิตถาวร</p>
              <p>เลขที่บัญชี: 405-0-77689-8</p>
              <p>ธนาคาร: ธนาคารกรุงไทย</p>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ข้อมูลการจัดส่ง</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={customerInfo.isPickup}
                  onCheckedChange={(checked) =>
                    handleCustomerInfoChange("isPickup", checked === true)
                  }
                />
                <label
                  htmlFor="pickup"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  รับหน้างาน
                </label>
              </div>

              <div>
                <label className="block mb-2">ชื่อ-นามสกุล</label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) =>
                    handleCustomerInfoChange("name", e.target.value)
                  }
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div>
                <label className="block mb-2">
                  ที่อยู่จัดส่ง + เบอร์โทร{" "}
                  {!customerInfo.isPickup && (
                    <span className="text-sm text-red-500">(จำเป็น)</span>
                  )}
                </label>
                <Textarea
                  value={customerInfo.address}
                  onChange={(e) =>
                    handleCustomerInfoChange("address", e.target.value)
                  }
                  placeholder={
                    customerInfo.isPickup
                      ? "ไม่ต้องระบุที่อยู่ (รับหน้างาน)"
                      : "กรอกที่อยู่จัดส่ง"
                  }
                  disabled={customerInfo.isPickup}
                />
              </div>

              <div>
                <label className="block mb-2">
                  อัพโหลดสลิปการโอนเงิน <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="slip-upload"
                  />
                  <label
                    htmlFor="slip-upload"
                    className={`flex items-center px-4 py-2 rounded cursor-pointer ${
                      customerInfo.slipImage
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white transition-colors`}
                  >
                    {customerInfo.slipImage ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        เลือกไฟล์แล้ว
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        เลือกไฟล์
                      </>
                    )}
                  </label>
                  {customerInfo.slipImage && (
                    <span className="text-sm text-gray-600">
                      {customerInfo.slipImage.name}
                    </span>
                  )}
                </div>
                {!customerInfo.slipImage && (
                  <p className="mt-1 text-sm text-red-500">
                    * กรุณาอัพโหลดสลิปการโอนเงิน
                  </p>
                )}
                {previewImage && (
                  <div className="mt-2 relative w-full max-w-xs h-48">
                    <Image
                      src={previewImage}
                      alt="สลิปการโอนเงิน"
                      fill
                      className="object-contain rounded shadow"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังส่งคำสั่งซื้อ...
                </>
              ) : (
                "ยืนยันการสั่งซื้อ"
              )}
            </Button>
          </form>
        </CardContent>

        {/* Copyright Footer */}
        <div className="text-center text-sm text-gray-500 py-4 border-t">
          2024 ระบบสั่งจองเสื้อ by Tiger E-San. All rights reserved.
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สั่งซื้อสำเร็จ</DialogTitle>
              <DialogDescription>
                ขอบคุณชาวเสือสำหรับการสั่งซื้อ ทางเราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว
                และจะดำเนินการจัดส่งตามที่อยู่ที่ระบุไว้
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                ปิด
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
