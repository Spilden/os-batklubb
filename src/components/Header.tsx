import Link from 'next/link'
import Image from 'next/image'
import BaseButton from '@/components/BaseButton'

export default function Header() {
  return (
    <header className="bg-white p-8 shadow-lg">
      <nav className="flex items-center justify-between">
        <Link href="/">
          <Image src="/obk_logo.svg" alt="Os Båtklubb" width={120} height={60} />
        </Link>

        {/*Desktop navigasjon*/}
        <ul className="flex gap-2">
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
      </nav>
    </header>
  )
}
