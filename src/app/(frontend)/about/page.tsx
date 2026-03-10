import { getPayload } from 'payload'
import config from '@/payload.config'
import { RichText } from '@payloadcms/richtext-lexical/react'

export default async function AboutPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'about',
  })

  const about = docs[0]

  return (
    <article>
      <h1 className="text-2xl">{about.title}</h1>
      <RichText data={about.content}/>
    </article>
  )
}
