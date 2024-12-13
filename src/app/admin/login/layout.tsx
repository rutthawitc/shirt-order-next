// src/app/admin/login/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Admin login page',
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex items-center justify-center min-h-screen p-4">
        {children}
      </main>
    </div>
  )
}