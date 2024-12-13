// src/components/SizeGuideCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface SizeInfo {
  code: string
  chest: string
}

const SIZES: SizeInfo[] = [
  { code: 'S', chest: '36"' },
  { code: 'M', chest: '38"' },
  { code: 'L', chest: '40"' },
  { code: 'XL', chest: '42"' },
  { code: '2XL', chest: '44"' },
  { code: '3XL', chest: '46"' },
  { code: '4XL', chest: '48"' },
  { code: '5XL', chest: '50"' },
  { code: '6XL', chest: '52"' }
]

export default function SizeGuideCard() {
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ตารางขนาดเสื้อ Jersey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">ไซส์</th>
                <th className="text-left p-2">รอบอก</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((size) => (
                <tr key={size.code} className="hover:bg-gray-50">
                  <td className="p-2 border">{size.code}</td>
                  <td className="p-2 border">{size.chest}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-gray-500 mt-4">
            * ขนาดรอบอกวัดจากจุดกว้างที่สุดของเสื้อ เมื่อวางราบ x 2
          </p>
        </div>
      </CardContent>
    </Card>
  )
}