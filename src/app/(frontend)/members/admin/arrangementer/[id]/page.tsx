import { notFound } from 'next/navigation'
import { BaseMemberCard } from '@/components/BaseMemberCard'
import BaseButton from '@/components/BaseButton'
import { EventForm } from '@/components/admin/EventForm'
import { getEvent, type EventStatus } from '@/lib/admin/events'
import { getAdminContext } from '@/lib/admin/getAdminContext'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { payload, admin } = await getAdminContext()
  const { id } = await params
  const event = await getEvent(payload, admin, Number(id)).catch(() => null)
  if (!event) notFound()

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Endre arrangement</h1>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
        <BaseButton href="/members/admin/arrangementer" variant="text" className="self-start">
          Tilbake
        </BaseButton>
        <BaseMemberCard>
          <EventForm
            initial={{
              id: event.id,
              title: event.title,
              description: event.description,
              startTime: event.startTime,
              endTime: event.endTime,
              color: event.color,
              status: event.status as EventStatus | null,
            }}
          />
        </BaseMemberCard>
      </div>
    </>
  )
}
