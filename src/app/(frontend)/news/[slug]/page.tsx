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
  return (
    <div className={`flex flex-col ${isPortrait ? 'lg:flex-row' : ''} gap-6 pt-4 mx-4`}>
      {image && (
        <Image
          src={image.url}
          alt={image.alt ?? article.title}
          width={image.width}
          height={image.height}
          className="rounded-lg w-auto h-auto self-center shadow-md"
        />
      )}
      <div className="flex flex-col h-full justify-start">
        <h1 className="text-3xl text-text font-display text-center pb-8">{article.title}</h1>
          <RichText
            className="prose lg:prose-xl text-text-muted whitespace-pre-wrap mx-auto "
            data={article.content}
          ></RichText>
      </div>
    </div>
  )
}
