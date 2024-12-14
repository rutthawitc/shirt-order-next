// src/components/SouvenirSizeGuideCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface DetailedSizeInfo {
  code: string
  width: number
  chest: number
  length: number
}

const DETAILED_SIZES: DetailedSizeInfo[] = [
  { code: 'S', width: 18.5, chest: 37.0, length: 26.4 },
  { code: 'M', width: 19.7, chest: 39.4, length: 27.6 },
  { code: 'L', width: 20.8, chest: 41.7, length: 28.7 },
  { code: 'XL', width: 22.0, chest: 44.0, length: 29.5 },
  { code: '2XL', width: 23.2, chest: 46.4, length: 30.3 },
  { code: '3XL', width: 24.4, chest: 48.8, length: 31.1 },
  { code: '4XL', width: 25.9, chest: 51.8, length: 32.6 },
  { code: '5XL', width: 27.9, chest: 55.8, length: 33.8 }
]

export default function SouvenirSizeGuideCard() {
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ตารางขนาดเสื้อที่ระลึก
        <p className="text-sm text-red-500">* ขนาดเสื้อ Jersey และเสื้อที่ระลึกจะไม่เหมือนกัน</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">SIZE</th>
                <th className="p-2 border">
                  WIDTH<br/>
                  <span className="text-sm text-gray-600">กว้าง</span>
                </th>
                <th className="p-2 border">
                  CHEST<br/>
                  <span className="text-sm text-gray-600">รอบอก</span>
                </th>
                <th className="p-2 border">
                  LENGTH<br/>
                  <span className="text-sm text-gray-600">ยาว</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {DETAILED_SIZES.map((size) => (
                <tr key={size.code} className="hover:bg-gray-50">
                  <td className="p-2 border text-center font-medium">{size.code}</td>
                  <td className="p-2 border text-center">{size.width.toFixed(1)}</td>
                  <td className="p-2 border text-center">{size.chest.toFixed(1)}</td>
                  <td className="p-2 border text-center">{size.length.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-gray-500 mt-4">
            * หน่วยวัดเป็นนิ้ว (inches)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}