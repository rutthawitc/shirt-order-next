// src/components/SouvenirSizeGuideCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function SouvenirSizeGuideCard() {
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ fontSize: '80%' }}>ตารางขนาดเสื้อที่ระลึก
        <p className="text-sm text-red-500" style={{ fontSize: '80%' }}>* ขนาดเสื้อ Jersey และเสื้อที่ระลึกจะไม่เหมือนกัน</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Image
            src="https://res.cloudinary.com/dbkdy9jfe/image/upload/v1762538109/IMG_1195_w0p5up.jpg"
            alt="ตารางขนาดเสื้อที่ระลึก"
            width={800}
            height={600}
            className="w-full h-auto max-w-2xl rounded-lg"
          />
        </div>
      </CardContent>
    </Card>
  )
}