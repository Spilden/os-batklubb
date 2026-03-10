import { getPayload } from 'payload'
import config from '@/payload.config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

export default async function AboutPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'about',
    depth: 1,
  })

  const about = docs[0]

  return (
    <article>
      <div>
        <Image
          src={(about.image as { url: string }).url}
          alt={about.title}
          width={600}
          height={400}
        />
      </div>
      <div>
        <h1 className="text-2xl">{about.title}</h1>
        <RichText data={about.content} />
      </div>
    </article>
  )
}
