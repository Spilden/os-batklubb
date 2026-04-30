import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SlippCalendar } from '@/components/SlippCalendar'

export default async function MembersPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) redirect('/admin/login')

  const slotsResult = await payload.find({
    collection: 'slipp-slots',
    limit: 200,
    depth: 1,
  })

  return (
    <main className="py-8">
      <SlippCalendar
        currentUser={user}
        initialSlots={slotsResult.docs}
      />
    </main>
  )
}