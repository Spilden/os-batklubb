import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'



export default async function HomePage() {
  // const payload = await getPayload({ config })

  // TODO: implementer find i collection istedenfor hardcodet data

  const newsArticles = {
    docs: [
      { id: '1', title: 'Vårens åpningsregatta', description: 'En fin dag på sjøen' },
      { id: '2', title: 'Ny brygge ferdigstilt', description: 'Endelig klar for sesongen' },
      { id: '3', title: 'Navigasjon for nybegynnere', description: 'Kurs starter snart' },
    ]
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full">
        <div className="rounded-t-xl bg-ocean mb-4 p-4">
          <h1 className="text-text text-2xl font-bold text-center">Hva skjer i havnen</h1>
        </div>
        <div className="flex flex-col gap-y-6 m-4">
          {newsArticles.docs.map((doc) => (
            // TODO: lage et oversiktskort for artikler som standardiserer artiklene
            <article key={doc.id} className="flex justify-between bg-background rounded-lg p-4 shadow-lg items-center mx-20">
              <h2 className="text-3xl text-text font-display">{doc.title}</h2>
              <p className="text-text-muted">{doc.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}