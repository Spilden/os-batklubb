'use client'

import Link from 'next/link'
import Image from 'next/image'
import BaseButton from '@/components/BaseButton'
import {useState} from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="bg-white p-8 shadow-lg">
      <nav className="flex items-center justify-between">
        <Link href="/">
          <Image src="/obk_logo.svg" alt="Os Båtklubb" width={120} height={60} />
        </Link>

        {/*Desktop navigasjon*/}
        <ul className="hidden md:flex gap-2">
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
              <BaseButton>Om Båtklubben</BaseButton>
            </Link>
          </li>
          <li>
            <Link href="/guest-marina">
              <BaseButton>Gjestehavn</BaseButton>
            </Link>
          </li>
          <li>
            <Link href="/contact">
              <BaseButton>Kontakt Oss</BaseButton>
            </Link>
          </li>
          <li>
            <Link href="/log-in">
              <BaseButton variant="secondary">Logg Inn</BaseButton>
            </Link>
          </li>
        </ul>

        {/*Hamburger meny knapp*/}
        <BaseButton className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? 'x' : '☰'}
        </BaseButton>

        {/*Mobil meny*/}
        {menuOpen && (
          <ul>
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
                <BaseButton>Om Båtklubben</BaseButton>
              </Link>
            </li>
            <li>
              <Link href="/guest-marina" onClick={() => setMenuOpen(false)}>
                <BaseButton>Gjestehavn</BaseButton>
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>
                <BaseButton>Kontakt Oss</BaseButton>
              </Link>
            </li>
            <li>
              <Link href="/log-in" onClick={() => setMenuOpen(false)}>
                <BaseButton variant="secondary">Logg Inn</BaseButton>
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  )
}
