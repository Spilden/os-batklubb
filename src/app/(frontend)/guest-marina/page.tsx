import React from 'react'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { imageGuard } from '@/utils/ImageGuard'
import Image from 'next/image'
import Link from 'next/link'

export default async function GuestMarinaPage() {
  const payload = await getPayload({ config: payloadConfig })
  const data = await payload.findGlobal({ slug: 'guestMarina' })

  const image = imageGuard(data.image)

  return (
    <div className="flex flex-col gap-y-40">
      <div className="flex flex-col lg:flex-row w-full gap-6">
        <div className="lg:w-3/5 shrink-0">
          <div className="sticky aspect-video top-4">
            {image && (
              <Image
                className="rounded-xl w-full h-auto"
                src={image.url}
                alt={image.alt}
                width={image.width}
                height={image.height}
              />
            )}
          </div>
        </div>
        <RichText className="prose lg:prose-xl" data={data.content} />
      </div>

      <div className="flex flex-col lg:flex-row w-full lg:justify-evenly">
        <div className="flex flex-col p-6">
          <h2 className="text-text text-2xl font-display pb-4">Priser</h2>
          <p>{`Døgnleie for gjestehavnen: ${data.price},-`}</p>
          <p className="pb-4">Døgnleien inkluderer alle serverdigheter på anlegget</p>
          <Link
            className="hover:underline"
            href={`https://qr.vipps.no/28/2/01/031/128382?v=1&amount=${data.price * 100}&message=Gjestehavn`}
          >
            Betal med {data.paymentInfo}
          </Link>
        </div>
        <div className="flex flex-col p-6">
          <h2 className="text-text text-2xl font-display pb-4">Her finner du oss</h2>
          <Link
            className="hover:underline pb-4"
            href="https://www.norgeskart.no/?zoom=17&lat=6706738.962449096&lon=-29259.61291015203&p=searchOptionsPanel&backgroundLayer=Nibcache_UTM33_EUREF89_v2&rotation=0&markerLon=-29265.284190059254&markerLat=6706737.734564466&projection=EPSG%3A25833"
          >
            <p>{`60° 9' 6.791" N | 5° 26' 41.825" E`}</p>
          </Link>
          <p>Bjørnavegen 60</p>
          <p>5208 OS</p>
        </div>
        <div className="p-6">
          <h2 className="text-text text-2xl font-display pb-4">Våre serverdigheter</h2>
          <ul className="list-disc pl-4">
            {data.facilities?.map((item, index) => (
              <li key={index}>{item.facility}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
