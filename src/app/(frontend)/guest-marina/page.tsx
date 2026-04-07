import React from 'react'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { imageGuard } from '@/utils/ImageGuard'
import Image from 'next/image'

export default async function GuestMarinaPage(){
  const payload = await getPayload({ config: payloadConfig })

  const data = await payload.findGlobal({slug: 'guestMarina'})
  console.log(JSON.stringify(data.content))

  const image = imageGuard(data.image)

  return (
    <div className="bg-sage rounded-xl shadow-lg w-full">
      <div className="rounded-t-xl bg-ocean p-4">
        <h1 className="text-text text-2xl font-bold text-center">{data.title}</h1>
      </div>
      <div className="flex flex-col gap-y-6 p-6">
        {image && (
          <Image src={image.url} alt={image.alt} width={image.width} height={image.height} />)}
        <RichText className="prose lg:prose-xl" data={data.content} />
      </div>
    </div>
  )
}