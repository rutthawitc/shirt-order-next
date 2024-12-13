// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-xl font-semibold">เกิดข้อผิดพลาด</h2>
      <p className="text-gray-600">ขออภัย เกิดข้อผิดพลาดบางอย่าง</p>
      <Button
        onClick={reset}
        variant="outline"
      >
        ลองใหม่อีกครั้ง
      </Button>
    </div>
  )
}