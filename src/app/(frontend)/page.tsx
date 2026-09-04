import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import PartnerCard from '@/components/PartnerCard'
import WeatherWidget from '@/components/WeatherWidget'
import NewsCard from '@/components/NewsCard'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const { docs: partners } = await payload.find({
    collection: 'partners',
    depth: 1,
  })

  const { docs: latestNews } = await payload.find({
    collection: 'news',
    depth: 2,
    limit: 1,
    sort: '-publishedAt',
    where: {
      publishedAt: {
        less_than_equal: new Date().toISOString(),
      },
    },
  })
  const latestArticle = latestNews[0]

  const parallaxSection = [
    {
      image: '/images/harbour1.webp',
      title: 'Os Båtklubb',
      text: 'Felleskap på sjøen siden 1955',
    },
    {
      image: '/images/harbour2.webp',
      title: 'Gjestebrygge',
      text: 'Vi har gjestebrygge og fasiliteter',
    },
    {
      image: '/images/sailboat.webp',
      title: 'Sosialt',
      text: 'En sosial klubb med fellesturer og arrangement',
    },
  ]

  return (
    <div className="w-full">
      {parallaxSection.map((section, i) => (
        <div
          key={i}
          className={`
      ${i === 0 ? 'rounded-t-xl' : ''}
      ${i === parallaxSection.length - 1 ? 'rounded-b-xl' : ''}
      overflow-hidden
    `}
        >
          <div
            className="relative h-[65vh] sm:h-[70vh] bg-fixed bg-top bg-cover flex items-end justify-center pb-6"
            style={{ backgroundImage: `url(${section.image})` }}
          >
            {i === 0 && (
              <a
                href={'#content-start'}
                aria-label="Rull ned for å se mer innhold"
                className="group flex flex-col items-center gap-1.5 text-white/90 hover:text-white transition-all drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] cursor-pointer"
              >
                <span className="text-xs uppercase tracking-widest font-semibold opacity-90 group-hover:opacity-100">
                  Rull ned
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            )}
          </div>
          <div
            id={i === 0 ? 'content-start' : undefined}
            className="flex justify-center bg-surface py-16 scroll-mt-6"
          >
            <div className="w-xl max-w-[90vw] pl-4">
              <h2 className="text-text text-4xl font-bold mb-4">{section.title}</h2>
              <p className="text-text-muted  text-lg">{section.text}</p>
            </div>
          </div>
        </div>
      ))}

      {latestArticle && (
        <section className="bg-surface rounded-xl shadow-lg w-full mt-4 p-6">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-ocean animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold font-display text-text">Siste nytt</h2>
            </div>
            <Link
              href="/news"
              className="text-sm font-medium text-ocean hover:text-ocean/80 transition-colors flex items-center gap-1 group"
            >
              <span>Alle nyheter</span>
              <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </Link>
          </div>

          <NewsCard article={latestArticle} />
        </section>
      )}

      <section className="bg-surface rounded-xl shadow-lg w-full mt-4 p-6">
        <div className="flex justify-center items-center w-full">
          <WeatherWidget days={3} />
        </div>
      </section>

      {partners.length > 0 && (
        <section className="bg-surface rounded-xl shadow-lg w-full mt-4">
          <div className="flex flex-wrap justify-center gap-4 p-4">
            {partners.map((partner) => (
              <PartnerCard partner={partner} key={partner.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
