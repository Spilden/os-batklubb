import { getAdminContext } from '@/lib/admin/getAdminContext'
import { BaseMemberCard } from '@/components/BaseMemberCard'
import BaseButton from '@/components/BaseButton'

export default async function AdminPage() {
  const { payload } = await getAdminContext()
  const now = new Date().toISOString()

  const [members, upcoming] = await Promise.all([
    payload.count({ collection: 'users', where: { active: { not_equals: false } } }),
    payload.count({ collection: 'events', where: { endTime: { greater_than_equal: now } } }),
  ])

  const sections = [
    {
      title: 'Medlemmer',
      href: '/members/admin/medlemmer',
      text: 'Legg til nye medlemmer, endre roller og deaktiver de som har sluttet.',
      footer: `${members.totalDocs} aktive medlemmer`,
    },
    {
      title: 'Vaktbok-oversikt',
      href: '/members/admin/vaktbok',
      text: 'Se hvor mange vaktbok-rapporter hver kameravakt har skrevet.',
    },
    {
      title: 'Arrangementer',
      href: '/members/admin/arrangementer',
      text: 'Legg inn, endre og avlys arrangementer i kalenderen.',
      footer: `${upcoming.totalDocs} kommende`,
    },
  ]

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Admin</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <BaseMemberCard key={s.href} title={s.title} footer={s.footer}>
            <p className="text-text py-2">{s.text}</p>
            <BaseButton href={s.href} variant="secondary" className="mt-2">
              Åpne
            </BaseButton>
          </BaseMemberCard>
        ))}
      </div>
    </>
  )
}
