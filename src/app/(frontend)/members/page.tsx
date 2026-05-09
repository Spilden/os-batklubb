import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { JSX } from 'react'

export default async function MembersPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  return (
    <div className="w-full">
      <h1 className="font-display text-text text-3xl font-bold text-center pb-4">Velkommen {user.name}</h1>
      <p className="text-primary text-xl text-center">Dette vil være din side med mer informasjon på veg</p>
    </div>
  )
}

type BaseCardProps = {
  className?: string
  title?: string
  content?: string
  footer?: string
  children?: JSX.Element
}

export function BaseCard({ title, content, footer, className, children}: BaseCardProps) {
  return (
    <div className={`bg-surface p-4 rounded-xl w-full pl-8 ${className}`}>
      <h2 className="text-text-muted font-display italic">{title}</h2>
      <p>{content}</p>
      {children}
      <p>{footer}</p>
    </div>
  )
}
