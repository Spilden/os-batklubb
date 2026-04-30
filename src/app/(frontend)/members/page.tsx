import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SlippCalendar } from '@/components/SlippCalendar'

export default async function MembersPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const [{ docs: requests }, settings] = await Promise.all([
    payload.find({ collection: 'slipp-bookings', limit: 200, depth: 1 }),
    payload.findGlobal({ slug: 'slipp-settings' }),
  ])

  return (
    <main className="py-8">
      <SlippCalendar
        currentUser={user}
        initialRequests={requests}
        settings={settings}
      />
    </main>
  )
}