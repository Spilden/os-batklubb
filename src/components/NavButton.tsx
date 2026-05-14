'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

type NavButtonProps = {
  href: string
  children: React.ReactNode
}

export function NavButton({ href, children }: NavButtonProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      className={`hover:bg-sage w-full p-4 pl-22 ${isActive ? 'bg-sage' : ''}`}
      href={href}
    >
      {children}
    </Link>
  )
}