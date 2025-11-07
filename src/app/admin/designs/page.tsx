import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AdminDesignsClient from '@/components/AdminDesignsClient'

export const dynamic = 'force-dynamic'

export default async function AdminDesignsPage() {
  const cookieStore = await cookies()
  const isAuthenticated = (await cookieStore).has('admin_authenticated')

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return <AdminDesignsClient />
}
