import type { News } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { imageGuard } from '@/utils/ImageGuard'

type NewsCardProps = {
  article: News
  className?: string
}

export default function NewsCard({ article, className = '' }: NewsCardProps) {
  const image = imageGuard(article.image)
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Link
      href={`/news/${article.slug}`}
      className={`group relative flex flex-col md:flex-row gap-6 p-5 sm:p-6 rounded-xl bg-surface hover:bg-background/40 border border-border/40 hover:border-ocean/40 shadow-md hover:shadow-lg transition-all cursor-pointer ${className}`}
    >
      {image && (
        <div className="relative w-full md:w-2/5 aspect-video shrink-0 overflow-hidden rounded-lg">
          <Image
            src={image.url}
            alt={image.alt ?? article.title}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex flex-col justify-center gap-y-3 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-text-muted bg-background px-2.5 py-1 rounded border border-border/40">
            {publishedDate}
          </span>
        </div>
        <h3 className="text-2xl font-display font-bold text-text group-hover:text-ocean transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-text-muted text-sm sm:text-base line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <span className="text-sm font-medium text-ocean mt-1 flex items-center gap-1 group-hover:underline underline-offset-4">
          Les hele saken &rarr;
        </span>
      </div>
    </Link>
  )
}
