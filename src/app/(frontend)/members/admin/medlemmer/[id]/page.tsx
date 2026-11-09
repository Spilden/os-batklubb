import { notFound } from 'next/navigation'
import { BaseMemberCard } from '@/components/BaseMemberCard'
import BaseButton from '@/components/BaseButton'
import { MemberForm } from '@/components/admin/MemberForm'
import { MemberStatusActions } from '@/components/admin/MemberStatusActions'
import { FormMessage } from '@/components/admin/FormMessage'
import { getMember } from '@/lib/admin/members'
import { getAdminContext } from '@/lib/admin/getAdminContext'
import { updateMemberAction } from '../actions'

export default async function EditMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ opprettet?: string }>
}) {
  const { payload, admin } = await getAdminContext()
  const { id } = await params
  const { opprettet } = await searchParams

  const member = await getMember(payload, admin, Number(id)).catch(() => null)
  if (!member) notFound()
  const isSelf = member.id === admin.id
  const active = member.active !== false

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">{member.name}</h1>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
        <BaseButton href="/members/admin/medlemmer" variant="text" className="self-start">
          Tilbake til medlemmer
        </BaseButton>

        {opprettet === '1' && (
          <FormMessage message="Medlemmet er opprettet, og velkomst-e-posten er sendt." />
        )}
        {opprettet === 'uten-epost' && (
          <FormMessage error="Medlemmet er opprettet, men velkomst-e-posten kunne ikke sendes. Prøv «Send velkomst-e-post på nytt»." />
        )}

        <BaseMemberCard title="Opplysninger" badge={active ? undefined : 'Deaktivert'}>
          <MemberForm
            action={updateMemberAction}
            submitLabel="Lagre endringer"
            isSelf={isSelf}
            initial={{
              id: member.id,
              name: member.name,
              email: member.email,
              medlemSiden: member.medlemSiden,
              roles: member.roles ?? [],
            }}
          />
        </BaseMemberCard>

        <BaseMemberCard title="Tilgang">
          <p className="text-text-muted text-sm pb-4">
            {active
              ? 'Et deaktivert medlem kan ikke logge inn, men vaktbok-rapporter og bookinger blir stående.'
              : 'Medlemmet er deaktivert og kan ikke logge inn.'}
          </p>
          <MemberStatusActions id={member.id} active={active} isSelf={isSelf} />
        </BaseMemberCard>
      </div>
    </>
  )
}
