// src/components/TestEnvironmentBanner.tsx
'use client'

import { env } from '@/config/env'

export default function TestEnvironmentBanner() {
  if (!env.isTestEnvironment) return null

  return (
    <div className="bg-yellow-500 text-black py-1 px-4 text-center text-sm font-medium sticky top-0 z-50">
      🔧 Test Environment - ระบบทดสอบ (ข้อมูลในระบบนี้ไม่ใช่ข้อมูลจริง)
    </div>
  )
}