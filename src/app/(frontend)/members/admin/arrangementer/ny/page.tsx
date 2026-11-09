import { BaseMemberCard } from '@/components/BaseMemberCard'
import BaseButton from '@/components/BaseButton'
import { EventForm } from '@/components/admin/EventForm'

export default function NewEventPage() {
  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Nytt arrangement</h1>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
        <BaseButton href="/members/admin/arrangementer" variant="text" className="self-start">
          Tilbake
        </BaseButton>
        <BaseMemberCard>
          <EventForm />
        </BaseMemberCard>
      </div>
    </>
  )
}
