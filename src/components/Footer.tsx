import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border/40 shadow-sm pt-12 pb-8 mt-auto text-text-muted">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hovedseksjon med 3 kolonner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-border/40">
          {/* Kolonne 1: Klubbinfo & Logo */}
          <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
            <Link href="/" className="inline-block">
              <Image src="/obk_logo.svg" alt="Os Båtklubb" width={110} height={55} />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Os Båtklubb – et trygt og aktivt samlingspunkt for båtglede og maritimt fellesskap i
              Os.
            </p>
          </div>

          {/* Kolonne 2: Hurtiglenker */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-3">
              Hurtiglenker
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/news" className="hover:text-ocean transition-colors">
                  Nyheter & oppdateringer
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-ocean transition-colors">
                  Om klubben
                </Link>
              </li>
              <li>
                <Link href="/guest-marina" className="hover:text-ocean transition-colors">
                  Gjestehavn & fasiliteter
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ocean transition-colors">
                  Kontakt oss
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolonne 3: Kontakt & Lokasjon */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-3">
              Kontakt & lokasjon
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Os Båtklubb</li>
              <li>Bjørnavegen 60, 5208 Os</li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-ocean transition-colors underline underline-offset-4"
                >
                  Send oss en henvendelse
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bunnlinje: Copyright & Utviklerkreditering */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <span>© {new Date().getFullYear()} Os Båtklubb</span>
          <span>
            Design & utvikling:{' '}
            <a
              href="https://progmatic.no"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-text hover:text-ocean transition-colors underline underline-offset-4"
            >
              Progmatic AS
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
