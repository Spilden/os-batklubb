import { NavButton } from '@/components/NavButton'
import React from 'react'

export default function MembersLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <div className="flex min-h-screen w-full gap-4">
      <aside className="w-sm bg-primary self-stretch -ml-4 -mt-4 -mb-4 ">
        <div className="flex flex-col">
          <NavButton href="/members">Medlemsside</NavButton>
          <NavButton href="/members/slipp">Slipp</NavButton>
        </div>
      </aside>

      <div className="flex-1">{children}</div>
    </div>
  )
}
