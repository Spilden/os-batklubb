'use client'
import Link from 'next/link'
import Image from 'next/image'
import BaseButton from '@/components/BaseButton'
import { useState } from 'react'
import LoginModal from '@/components/modals/LoginModal'
import { usePathname, useRouter } from 'next/navigation'

type props = {
  user: { email: string } | null
}

export default function HeaderNav({ user }: props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isLinkActive = (href: string) => {
    if (!pathname) return false
    if (href === '/') {
      return pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const navLinks = [
    { href: '/', label: 'Hjem' },
    { href: '/news', label: 'Nyheter' },
    { href: '/about', label: 'Om oss' },
    { href: '/guest-marina', label: 'Gjestehavn' },
    { href: '/contact', label: 'Kontakt' },
    ...(user ? [{ href: '/members', label: 'Medlem' }] : []),
  ]

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/')
    router.refresh()
  }

  const loginButton = user ? (
    <BaseButton variant="secondary" onClick={handleLogout}>
      Logg Ut
    </BaseButton>
  ) : (
    <BaseButton
      variant="secondary"
      onClick={() => {
        setMenuOpen(false)
        setShowLoginModal(true)
      }}
    >
      Logg Inn
    </BaseButton>
  )

  return (
    <header className="bg-surface p-4 lg:p-8 shadow-lg sticky top-0 z-50">
      <nav className="flex items-center justify-between">
        <Link href="/">
          <Image src="/obk_logo.svg" alt="Os Båtklubb" width={120} height={60} priority />
        </Link>

        {/*Desktop navigasjon*/}
        <ul className="hidden lg:flex gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <BaseButton href={link.href} active={isLinkActive(link.href)}>
                {link.label}
              </BaseButton>
            </li>
          ))}
          <li>{loginButton}</li>
        </ul>

        {/*Hamburger meny knapp*/}
        <BaseButton className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? 'X' : '☰'}
        </BaseButton>

        {/*Mobil meny*/}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <ul className="fixed top-0 right-0 h-full w-auto max-w-xs bg-surface z-50 flex flex-col gap-2 p-8 shadow-2xl lg:hidden items-end border-l border-border/50">
              <li className="mb-4">
                <BaseButton variant="secondary" onClick={() => setMenuOpen(false)}>
                  X
                </BaseButton>
              </li>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <BaseButton
                    href={link.href}
                    active={isLinkActive(link.href)}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </BaseButton>
                </li>
              ))}
              <li>{loginButton}</li>
            </ul>
          </div>
        )}
      </nav>
      {showLoginModal && <LoginModal onCloseAction={() => setShowLoginModal(false)} />}
    </header>
  )
}
