import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import NewsList from '@/components/NewsList'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const newsArticles = await payload.find({
    collection: 'news',
    depth: 2,
    sort: '-publishedAt',
    where: {
      publishedAt: {
        less_than_equal: new Date().toISOString(),
      },
    },
  })

  return (
    <>
      <div className="rounded-xl bg-ocean p-4">
        <h1 className="text-surface text-2xl font-display font-bold text-center">Hva skjer i havnen</h1>
      </div>
      <NewsList initialArticles={newsArticles.docs} initialHasNextPage={newsArticles.hasNextPage} />
    </>
  )
}
