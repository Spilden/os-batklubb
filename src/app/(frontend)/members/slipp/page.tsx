import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SlippCalendar } from '@/components/SlippCalendar'

export default async function SlippPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const [{ docs: requests }, settings] = await Promise.all([
    payload.find({ collection: 'slipp-bookings', limit: 200, depth: 1 }),
    payload.findGlobal({ slug: 'slipp-settings' }),
  ])

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Booking av slipp plass</h1>
      <SlippCalendar
        currentUser={user}
        initialRequests={requests}
        settings={settings}
      />
      <p className="text-text text-center text-xl p-10">Klikk på dagen du vil booke eller dra over de dagene/timene du ønsker å booke slipp.</p>
    </>
  )
}