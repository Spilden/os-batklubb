'use client'

import Link from 'next/link'
import Image from 'next/image'
import BaseButton from '@/components/BaseButton'
import { useState } from 'react'
import LoginModal from '@/components/modals/LoginModal'
import { useRouter } from 'next/navigation'

type props = {
  user: { email: string } | null
}

export default function HeaderNav({ user }: props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push("/")
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
    <header className="bg-surface p-8 shadow-lg relative">
      <nav className="flex items-center justify-between">
        <Link href="/">
          <Image src="/obk_logo.svg" alt="Os Båtklubb" width={120} height={60} />
        </Link>

        {/*Desktop navigasjon*/}
        <ul className="hidden lg:flex gap-2">
          <li>
            <Link href="/">
              <BaseButton>Hjem</BaseButton>
            </Link>
          </li>
          <li>
            <Link href="/news">
              <BaseButton>Nyheter</BaseButton>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <BaseButton>Om Klubben</BaseButton>
            </Link>
          </li>
          <li>
            <Link href="/guest-marina">
              <BaseButton>Gjestehavn</BaseButton>
            </Link>
          </li>
          <li>
            <Link href="/contact">
              <BaseButton>Kontakt</BaseButton>
            </Link>
          </li>
          <li className={`${user ? 'block' : 'hidden'}`}>
            <Link href="/members">
              <BaseButton>Medlemmer</BaseButton>
            </Link>
          </li>
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
            <ul className="fixed top-0 right-0 h-full w-72 bg-white z-50 flex flex-col gap-2 p-8 shadow-2xl lg:hidden">
              <li className="mb-4">
                <BaseButton variant="secondary" onClick={() => setMenuOpen(false)}>
                  X
                </BaseButton>
              </li>
              <li>
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <BaseButton>Hjem</BaseButton>
                </Link>
              </li>
              <li>
                <Link href="/news" onClick={() => setMenuOpen(false)}>
                  <BaseButton>Nyheter</BaseButton>
                </Link>
              </li>
              <li>
                <Link href="/about" onClick={() => setMenuOpen(false)}>
                  <BaseButton>Om Klubben</BaseButton>
                </Link>
              </li>
              <li>
                <Link href="/guest-marina" onClick={() => setMenuOpen(false)}>
                  <BaseButton>Gjestehavn</BaseButton>
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={() => setMenuOpen(false)}>
                  <BaseButton>Kontakt</BaseButton>
                </Link>
              </li>
              <li className={`${user ? 'block' : 'hidden'}`}>
                <Link href="/members">
                  <BaseButton>Medlemmer</BaseButton>
                </Link>
              </li>
              <li>{loginButton}</li>
            </ul>
          </div>
        )}
      </nav>
      {showLoginModal && <LoginModal onCloseAction={() => setShowLoginModal(false)} />}
    </header>
  )
}
