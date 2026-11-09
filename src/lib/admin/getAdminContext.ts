import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { isAdmin } from './requireAdmin'

/** For admin pages: returns payload + admin user, or redirects non-admins away. */
export async function getAdminContext(): Promise<{ payload: Payload; admin: User }> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/')
  if (!isAdmin(user)) redirect('/members')
  return { payload, admin: user }
}
