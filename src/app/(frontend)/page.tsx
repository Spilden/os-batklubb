import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import PartnerCard from '@/components/PartnerCard'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const { docs: partners } = await payload.find({
    collection: 'partners',
    depth: 1,
  })

  return (
    <>

      {partners.length > 0 && (
        <section className="bg-sage rounded-xl shadow-lg w-full mt-4">
          <div className="flex flex-wrap justify-center gap-4 p-4">
            {partners.map((partner) => (
              <PartnerCard partner={partner} key={partner.id} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
