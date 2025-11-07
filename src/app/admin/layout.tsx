// src/app/admin/layout.tsx
import { Metadata } from 'next'
import AdminNav from '@/components/AdminNav'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for Tiger Thailand Meeting 2025',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      {children}
    </div>
  )
}