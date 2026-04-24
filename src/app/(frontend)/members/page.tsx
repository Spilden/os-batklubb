import { redirect } from 'next/navigation'
import { getUser } from '@/app/lib/auth'

export default async function MembersPage() {
  const user = await getUser()

  if (!user) redirect('/')

  return <h1>Du er innlogget {user.email}</h1>
}
