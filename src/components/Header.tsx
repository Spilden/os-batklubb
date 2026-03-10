import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header>
      <nav>
        <Link href="/">
          <Image src="/obk_logo.svg" alt="Os Båtklubb" width={120} height={60} />
        </Link>

        {/*Desktop navigasjon*/}
        <ul>
          <li>
            <Link href="/">Hjem</Link>
          </li>
          <li>
            <Link href="/news">Nyheter</Link>
          </li>
          <li>
            <Link href="/about">Om Båtklubben</Link>
          </li>
          <li>
            <Link href="/guest-marina">Gjestehavn</Link>
          </li>
          <li>
            <Link href="/contact">Kontakt Oss</Link>
          </li>
          <li>
            <Link href="/log-in">Logg Inn</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
