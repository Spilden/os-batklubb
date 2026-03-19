import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import BaseButton from '@/components/BaseButton'
import Image from 'next/image'
import { imageGuard } from '@/utils/ImageGuard'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { docs: partners } = await payload.find({
    collection: 'partners',
    depth: 1,
  })

  return (
    <>
      <section>
        <div className="flex pt-2 items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-lg w-96">
            <h1 className="font-display text-3xl text-text">Her er en tittel</h1>
            <p className="text-text-muted mt-2">Her er en beskrivelse.</p>
            <div>
              <BaseButton>primary</BaseButton>
              <BaseButton variant="secondary">Secondary</BaseButton>
              <BaseButton variant="text">textbutton</BaseButton>
            </div>
          </div>
        </div>
      </section>
      <section>
        {partners.map((partner) => {
          const partnerLogo = imageGuard(partner.logo)

          return (
            <div key={partner.id}>
              <h2>{partner.name}</h2>
              {partnerLogo?.url && (
                <Image
                  src={partnerLogo.url}
                  alt={partnerLogo.alt ?? partner.name}
                  width={partnerLogo.width}
                  height={partnerLogo.height}
                  className="object-contain"
                />
              )}
            </div>
          )
        })}
      </section>
    </>
  )
}
