// src/app/admin/page.tsx
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/AdminDashboard"
import { cookies } from "next/headers"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthenticated = (await cookieStore).has('admin_authenticated')

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="container mx-auto py-8">
      <AdminDashboard />
    </div>
  )
}