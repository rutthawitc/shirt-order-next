// src/components/SizeGuideCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function SizeGuideCard() {
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ตารางขนาดเสื้อ
          <p className="text-sm text-red-500">* ขนาดเสื้อแขนสั้นแขนยาวมีขนาดเท่ากัน *</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Image
            src="https://res.cloudinary.com/dbkdy9jfe/image/upload/v1762538109/IMG_1195_w0p5up.jpg"
            alt="ตารางขนาดเสื้อ"
            width={800}
            height={600}
            className="w-full h-auto max-w-2xl rounded-lg"
          />
        </div>
      </CardContent>
    </Card>
  )
}