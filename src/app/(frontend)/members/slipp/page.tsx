import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SlippCalendar } from '@/components/SlippCalendar'
import BookingNotice from '@/components/BookingNotice'

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
      <h1 className="text-text font-display text-center text-3xl pt-8 pb-4">Booking av slipp</h1>
      <BookingNotice
        description="Kalenderen og nettbooking for slipp er under utvikling og ikke offisielt i drift ennå. Bindende avtale og reservasjon av slipp må inntil videre gjøres direkte med ansvarlig person."
        testNotice="Du kan fritt klikke eller markere dager i kalenderen for å teste hvordan bookingen fungerer."
      />
      <SlippCalendar
        currentUser={user}
        initialRequests={requests}
        settings={settings}
      />
      <p className="text-text-muted text-center text-sm p-6">
        Klikk på en dag eller dra over dagene du ønsker for å prøve bookingfunksjonen.
      </p>
    </>
  )
}