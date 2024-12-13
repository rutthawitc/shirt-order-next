// src/app/layout.tsx
import type { Metadata } from "next"
import { Noto_Sans_Thai } from "next/font/google"
import "./globals.css"

const notoSansThai = Noto_Sans_Thai({ 
  subsets: ["thai"],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],  // เลือก weight ที่จะใช้
})

export const metadata: Metadata = {
  title: "ระบบสั่งจองเสื้อ - Tiger Thailand Meeting 2025",
  description: "ระบบสั่งจองเสื้อสำหรับงาน Tiger Thailand Meeting 2025",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={notoSansThai.className}>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            {/* Header Section */}
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                ระบบสั่งจองเสื้อ
              </h1>
              <h2 className="text-xl font-semibold text-gray-700 mt-2">
                Tiger Thailand Meeting 2025
              </h2>
              
              {/* Important Notices */}
              <div className="space-y-2 mt-4">
                <p className="text-red-600">
                  ** เสื้อสำหรับใส่เข้างาน คือ แบบที่ 1 และ แบบที่ 2 เท่านั้น **
                </p>
                <p className="text-orange-600">
                  ** สั่งได้ตั้งแต่วันนี้ จนถึง 10 มกราคม 2568 **
                </p>
              </div>
            </header>

            {/* Main Content */}
            <main className="mb-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="text-center text-gray-500 text-sm mt-auto py-4">
              <div className="border-t pt-4">
                <p>&copy; 2024 ระบบสั่งจองเสื้อ by Tiger E-San. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}