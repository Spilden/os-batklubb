import { NavButton } from '@/components/NavButton'
import React from 'react'
import BaseButton from '@/components/BaseButton'

export default function MembersLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4 min-h-[calc(100vh-296px)]">
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
      <aside className="hidden lg:block w-xs bg-surface self-stretch -ml-4 -mt-4 -mb-4 z-10">
        <div className="flex flex-col fixed w-xs top-[123] pt-8">
          <NavButton href="/members">Medlemsside</NavButton>
          <NavButton href="/members/slipp">Slipp</NavButton>
          <NavButton href="/members/clubhouse">Klubbhus</NavButton>
        </div>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  )
}
