import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AdminCombosClient from '@/components/AdminCombosClient'

export const dynamic = 'force-dynamic'

export default async function AdminCombosPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.has('admin_authenticated')

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return <AdminCombosClient />
}
