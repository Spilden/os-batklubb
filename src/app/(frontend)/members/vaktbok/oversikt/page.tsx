import { redirect } from 'next/navigation'

export default async function VaktbokOversiktRedirect({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const { year } = await searchParams
  redirect(year ? `/members/admin/vaktbok?year=${encodeURIComponent(year)}` : '/members/admin/vaktbok')
}
