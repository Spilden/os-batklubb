import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import BaseButton from '@/components/BaseButton'
import PartnerCard from '@/components/PartnerCard'

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

      {partners.length > 0 && (
        <section>
          {partners.map((partner) => (
            <PartnerCard partner={partner} key={partner.id} />
          ))}
        </section>
      )}
    </>
  )
}
