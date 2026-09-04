import { getPayload } from 'payload'
import config from '@payload-config'
import { imageGuard } from '@/utils/ImageGuard'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'

type NewsStoryPageProps = {
  params: Promise<{ slug: string }>
}

export default async function NewsStoryPage({ params }: NewsStoryPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const articles = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  const article = articles.docs[0]
  const image = imageGuard(article.image)
  const isPortrait = image ? image.height > image.width : false
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return (
    <div className={`flex flex-col ${isPortrait ? 'lg:flex-row' : ''} gap-6 pt-4 mx-4 max-w-4xl lg:mx-auto`}>
      {image && (
        <div
          className={`relative shrink-0 overflow-hidden rounded-lg shadow-md ${
            isPortrait ? 'w-full max-w-xs h-80 self-center lg:self-start' : 'w-full h-64 md:h-96'
          }`}
        >
          <Image
            src={image.url}
            alt={image.alt ?? article.title}
            fill
            sizes={isPortrait ? '(min-width: 1024px) 320px, 100vw' : '100vw'}
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col h-full min-w-0 flex-1 justify-start">
        <h1 className="text-3xl text-text font-display text-center pb-2">{article.title}</h1>
        <p className="text-text-muted text-sm text-center pb-8">{publishedDate}</p>
          <RichText
            className="prose lg:prose-xl text-text-muted whitespace-pre-wrap mx-auto "
            data={article.content}
          ></RichText>
      </div>
    </div>
  )
}
