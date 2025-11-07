import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import PrintShippingLabels from '@/components/PrintShippingLabels'

export const dynamic = 'force-dynamic'

export default async function PrintLabelsPage() {
  const cookieStore = await cookies()
  const isAuthenticated = (await cookieStore).has('admin_authenticated')

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return <PrintShippingLabels />
}
