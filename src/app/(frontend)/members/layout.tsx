import { NavButton } from '@/components/NavButton'
import React from 'react'
import BaseButton from '@/components/BaseButton'

export default function MembersLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full gap-4">
      <nav className="flex lg:hidden">
        <BaseButton href="/members" variant="text" className="flex-1 text-center p-3 text-sm">
          Medlemsside
        </BaseButton>
        <BaseButton href="/members/slipp" variant="text" className="flex-1 text-center p-3 text-sm">
          Slipp
        </BaseButton>
        <BaseButton
          href="/members/clubhouse"
          variant="text"
          className="flex-1 text-center p-3 text-sm"
        >
          Klubbhus
        </BaseButton>
      </nav>
      <aside className="hidden lg:block w-xs bg-surface self-stretch -ml-4 -mt-4 -mb-4 z-50">
        <div className="flex flex-col">
          <NavButton href="/members">Medlemsside</NavButton>
          <NavButton href="/members/slipp">Slipp</NavButton>
          <NavButton href="/members/clubhouse">Klubbhus</NavButton>
        </div>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  )
}
