import { BaseMemberCard } from '@/components/BaseMemberCard'
import BaseButton from '@/components/BaseButton'
import { MemberForm } from '@/components/admin/MemberForm'
import { createMemberAction } from '../actions'

export default function NewMemberPage() {
  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Nytt medlem</h1>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
        <BaseButton href="/members/admin/medlemmer" variant="text" className="self-start">
          Tilbake
        </BaseButton>
        <BaseMemberCard>
          <p className="text-text-muted text-sm pb-4">
            Medlemmet får automatisk en e-post med lenke for å lage sitt eget passord.
          </p>
          <MemberForm action={createMemberAction} submitLabel="Opprett medlem" />
        </BaseMemberCard>
      </div>
    </>
  )
}
