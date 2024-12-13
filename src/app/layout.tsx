// src/app/layout.tsx
import { Metadata } from 'next'
import { Noto_Sans_Thai } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from '@vercel/speed-insights/next';

const notoSansThai = Noto_Sans_Thai({ 
  subsets: ["thai"],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
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
    <html lang="th" className={notoSansThai.className}>
      <body>
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  )
}