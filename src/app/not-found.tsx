// src/app/not-found.tsx
import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-2xl font-semibold mb-4">ไม่พบหน้าที่คุณต้องการ</h2>
      <p className="text-gray-600 mb-6">ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        กลับหน้าแรก
      </Link>
    </div>
  )
}