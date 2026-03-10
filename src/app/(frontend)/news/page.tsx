import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'



export default async function HomePage() {
  const payload = await getPayload({ config })

  const newsArticles = await payload.find({
    collection: 'news',
    depth: 2,
    where: {
      publishedAt: {
        less_than_equal: new Date().toISOString()
      }
    }
  })

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