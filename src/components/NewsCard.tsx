import { Media, News } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'

type NewsCardProps = {
  article: News
}

export default function NewsCard({ article }: NewsCardProps) {
  const image = article.image as Media
  return (
    <Link
      key={article.id}
      href={`/news/${article.slug}`}
      className="flex bg-surface rounded-lg p-4 shadow-lg w-full gap-4 cursor-pointer hover:shadow-ocean"
    >
      <div className="relative w-3/5 aspect-video flex-shrink-0">
        <Image src={image.url!} alt={image.alt!} fill className="rounded-lg object-cover" />
      </div>
      <div className="flex flex-col gap-y-4 h-full mx-4">
        <h2 className="text-3xl text-text font-display text-center">{article.title}</h2>
        <p className="text-text-muted whitespace-pre-wrap">{article.excerpt}</p>
      </div>
    </Link>
  )
}
