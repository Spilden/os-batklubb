'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

const PAGE_SIZE = 10

export async function loadMoreNews(page: number) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'news',
    depth: 2,
    limit: PAGE_SIZE,
    page,
    sort: '-publishedAt',
    where: {
      publishedAt: {
        less_than_equal: new Date().toISOString(),
      },
    },
  })

  return { docs: result.docs, hasNextPage: result.hasNextPage }
}
