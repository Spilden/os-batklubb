import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import fs from 'fs'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { News } from './collections/News'
import { Partners} from '@/collections/Partners'
import { About } from './globals/About'
import { GuestMarina } from '@/globals/GuestMarina'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, News, Partners],
  globals: [About, GuestMarina],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],

  onInit: async (payload) => {
    // Seed bilde
    const existingMedia = await payload.find({ collection: 'media', where: { alt: { equals: 'Vargavågen Gjestehavn' } } })

    let imageId: number | string

    if (existingMedia.totalDocs === 0) {
      const imagePath = path.resolve(dirname, './seed/brann_i_osbaatklubb.webp')
      const imageFile = await payload.create({
        collection: 'media',
        data: { alt: 'Vargavågen Gjestehavn' },
        file: {
          data: fs.readFileSync(imagePath),
          mimetype: 'image/jpeg',
          name: 'gjestehavn.jpg',
          size: fs.statSync(imagePath).size,
        },
      })
      imageId = imageFile.id
    } else {
      imageId = existingMedia.docs[0].id
    }

    // Seed GuestMarina global
    await payload.updateGlobal({
      slug: 'guestMarina',
      data: {
        title: 'Vargavågen Gjestehavn',
        price: 150,
        paymentInfo: 'Vipps til 128382 – Os Båtklubb',
        image: imageId,
        content: {
          root: {
            children: [
              {
                children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Vargavågen er en fredelig og godt beskyttet havn, skjermet mot vær og vind. Her finner du rolige og idylliske omgivelser – perfekt for deg som ønsker å legge til i en naturskjønn og historisk rik del av kysten.', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Havnen har 8 faste gjesteplasser, og flere plasser kan benyttes ved behov.', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                children: [{ detail: 0, format: 1, mode: 'normal', style: '', text: 'Historikk', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Vargavågen er et område med rik historie. I nærheten finner du flere historiske severdigheter, blant annet Vargahålo som er synlig fra havnen, helleristningsfelt og klebersteinbrudd fra steinalderen.', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                children: [{ detail: 0, format: 1, mode: 'normal', style: '', text: 'Turterreng', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Området byr på fine turmuligheter for deg som vil utforske naturen til fots.', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                children: [{ detail: 0, format: 1, mode: 'normal', style: '', text: 'Praktisk informasjon', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Det er ingen butikk i umiddelbar nærhet, men det finnes en kiosk på Halhjem fergekai. Nærmeste dagligvarebutikk er Kiwi Moberg, ca. 4 km unna.', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                children: [{ detail: 0, format: 1, mode: 'normal', style: '', text: 'Fasiliteter', type: 'text', version: 1 }],
                direction: null, format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '',
              },
              {
                direction: null, format: '', indent: 0, type: 'list', version: 1, listType: 'bullet', start: 1, tag: 'ul',
                children: [
                  { children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Sanitæranlegg med toalett og dusj', type: 'text', version: 1 }], direction: null, format: '', indent: 0, type: 'listitem', version: 1, value: 1 },
                  { children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Vaskemaskin og tørketrommel', type: 'text', version: 1 }], direction: null, format: '', indent: 0, type: 'listitem', version: 1, value: 2 },
                  { children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Grillhytte tilgjengelig for gjester', type: 'text', version: 1 }], direction: null, format: '', indent: 0, type: 'listitem', version: 1, value: 3 },
                  { children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Egen badestrand', type: 'text', version: 1 }], direction: null, format: '', indent: 0, type: 'listitem', version: 1, value: 4 },
                  { children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Slipp – bestilling av slipping kan gjøres på forespørsel', type: 'text', version: 1 }], direction: null, format: '', indent: 0, type: 'listitem', version: 1, value: 5 },
                  { children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: 'Høytrykkspyler kan leies ved behov', type: 'text', version: 1 }], direction: null, format: '', indent: 0, type: 'listitem', version: 1, value: 6 },
                ],
              },
            ],
            direction: null, format: '', indent: 0, type: 'root', version: 1,
          },
        },
      },
    })
  },
})
