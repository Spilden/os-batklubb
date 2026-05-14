import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import PartnerCard from '@/components/PartnerCard'

import WeatherWidget from '@/components/WeatherWidget'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const { docs: partners } = await payload.find({
    collection: 'partners',
    depth: 1,
  })

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
            className="h-screen bg-fixed bg-top bg-cover"
            style={{ backgroundImage: `url(${section.image})` }}
          />
          <div className="flex justify-center bg-surface py-16">
            <div className="w-xl max-w-[90vw] pl-4">
              <h2 className="text-text text-4xl font-bold mb-4">{section.title}</h2>
              <p className="text-text-muted  text-lg">{section.text}</p>
            </div>
          </div>
        </div>
      ))}

      <section className="bg-surface rounded-xl shadow-lg w-full mt-4">
        <div className="h-50">
          <WeatherWidget></WeatherWidget>

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
