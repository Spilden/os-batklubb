import { getAdminContext } from '@/lib/admin/getAdminContext'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await getAdminContext()
  return <>{children}</>
}
