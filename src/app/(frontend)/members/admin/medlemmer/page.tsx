import BaseButton from '@/components/BaseButton'
import { listMembers, MEMBER_ROLE_LABELS } from '@/lib/admin/members'
import { getAdminContext } from '@/lib/admin/getAdminContext'
import { MemberSearchList, type MemberRow } from '@/components/admin/MemberSearchList'

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('nb-NO', { timeZone: 'Europe/Oslo' }) : '—'
}

// Everyone has «Medlem», so only show it when there are no other roles.
function extraRoleLabels(roles?: string[] | null): string[] {
  const extra = (roles ?? []).filter((r) => r !== 'member')
  return extra.length
    ? extra.map((r) => MEMBER_ROLE_LABELS[r as keyof typeof MEMBER_ROLE_LABELS])
    : [MEMBER_ROLE_LABELS.member]
}

export default async function MembersAdminPage() {
  const { payload, admin } = await getAdminContext()
  const members = await listMembers(payload, admin, { includeInactive: true })

  const rows: MemberRow[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    active: m.active !== false,
    roles: extraRoleLabels(m.roles),
    roleKeys: m.roles ?? [],
    since: m.medlemSiden ? m.medlemSiden.slice(0, 10) : null,
    sinceLabel: formatDate(m.medlemSiden),
  }))

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Medlemmer</h1>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap justify-between gap-4">
          <BaseButton href="/members/admin" variant="text">
            Tilbake
          </BaseButton>
          <BaseButton href="/members/admin/medlemmer/ny">Nytt medlem</BaseButton>
        </div>
        <MemberSearchList members={rows} />
      </div>
    </>
  )
}
