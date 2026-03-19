import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import NewsCard from '@/components/NewsCard'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const newsArticles = await payload.find({
    collection: 'news',
    depth: 2,
    where: {
      publishedAt: {
        less_than_equal: new Date().toISOString(),
      },
    },
  })

  return (
    <div className="bg-sage rounded-xl shadow-lg w-full">
      <div className="rounded-t-xl bg-ocean p-4">
        <h1 className="text-text text-2xl font-bold text-center">Hva skjer i havnen</h1>
      </div>
      <div className="flex flex-col gap-y-6 p-6">
        {newsArticles.docs.length === 0 ? (
          <p className="text-text-muted text-center p-10">Ingen nyhetssaker å vise</p>
        ) : (
          newsArticles.docs.map((newsArticle) => (
            <NewsCard article={newsArticle} key={newsArticle.id} />
          ))
        )}
      </div>
    </div>
  )
}
