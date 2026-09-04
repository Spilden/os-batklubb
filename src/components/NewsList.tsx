'use client'

import { useState, useTransition } from 'react'
import type { News } from '@/payload-types'
import NewsCard from '@/components/NewsCard'
import BaseButton from '@/components/BaseButton'
import { loadMoreNews } from '@/app/(frontend)/news/actions'

type NewsListProps = {
  initialArticles: News[]
  initialHasNextPage: boolean
}

export default function NewsList({ initialArticles, initialHasNextPage }: NewsListProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  function handleLoadMore() {
    startTransition(async () => {
      const nextPage = page + 1
      const result = await loadMoreNews(nextPage)
      setArticles((prev) => [...prev, ...result.docs])
      setHasNextPage(result.hasNextPage ?? false)
      setPage(nextPage)
    })
  }

  return (
    <div className="flex flex-col gap-y-6 p-6">
      {articles.length === 0 ? (
        <p className="text-text-muted text-center p-10">Ingen nyhetssaker å vise</p>
      ) : (
        articles.map((article) => <NewsCard article={article} key={article.id} />)
      )}
      {hasNextPage && (
        <BaseButton onClick={handleLoadMore} disabled={isPending} className="self-center">
          {isPending ? 'Laster…' : 'Se flere nyheter'}
        </BaseButton>
      )}
    </div>
  )
}
