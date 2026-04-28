import { getUser } from '@/app/lib/auth'
import HeaderNav from '@/components/HeaderNav'

export default async function Header() {
  const user = await getUser()
  return <HeaderNav user={user} />
}