import { getPayload } from 'payload'
import config from '@/payload.config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { imageGuard } from '@/utils/ImageGuard'

export default async function AboutPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const about = await payload.findGlobal({
    slug: 'about',
    depth: 1,
  })

  if (!about.title && !about.image && !about.content) {
    return <p className="p-2 flex justify-center">Ingen innhold ennå</p>
  }

  const image = imageGuard(about.image)

  return (
    <article className="flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto px-6 py-12">
      {image && (
        <div className="w-full lg:w-1/2">
          <Image
            src={image.url}
            alt={image.alt ?? about.title}
            width={image.width}
            height={image.height}
            className="rounded-lg w-full object-cover"
          />
        </div>
      )}
      <div className="w-full lg:w-1/2 self-center">
        <h1 className="text-2xl font-display text-text font-bold mb-4 text-center">
          {about.title}
        </h1>
        <RichText className="text-text-muted" data={about.content} />
      </div>
    </article>
  )
}
