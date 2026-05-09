import { News } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { imageGuard } from '@/utils/ImageGuard'

type NewsCardProps = {
  article: News
}

export default function NewsCard({ article }: NewsCardProps) {
  const image = imageGuard(article.image)
  return (
    <Link
      key={article.id}
      href={`/news/${article.slug}`}
      className="flex flex-col md:flex-row bg-surface rounded-lg p-4 shadow-lg w-full gap-4 cursor-pointer hover:shadow-ocean"
    >
      {image && (
        <div className="relative w-full md:w-2/5 aspect-video shrink-0">
          <Image
            src={image.url}
            alt={image.alt ?? article.title}
            fill
            sizes="(max-width: 640px) 100vw 40vw"
            className="rounded-lg object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-y-4 min-w-0">
        <h2 className="text-3xl text-text font-display text-center">{article.title}</h2>
        <p className="text-text-muted whitespace-pre-wrap">{article.excerpt}</p>
      </div>
    </Link>
  )
}
