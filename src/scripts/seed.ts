console.log('Scriptet starter')
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { News } from '@/payload-types'

async function seed() {
  try{
  const payload = await getPayload({ config })

  console.log('Starter seeding...')

  // -------------------------------------------------------
  // MEDIA – placeholder-bilde
  // -------------------------------------------------------

  // Vi laster opp én placeholder-fil som gjenbrukes
  const placeholderUrl = 'https://placehold.co/800x600/1a3a5c/ffffff.png'
  const placeholderRes = await fetch(placeholderUrl)
  const buffer = Buffer.from(await placeholderRes.arrayBuffer())

  const placeholderMedia = await payload.create({
    collection: 'media',
    data: { alt: 'Placeholder' },
    file: {
      data: buffer,
      mimetype: 'image/png',
      name: 'placeholder.png',
      size: buffer.length,
    },
  })

  console.log('Media lastet opp')

  // -------------------------------------------------------
  // PARTNERS
  // -------------------------------------------------------

  const partners = [
    { name: 'Progmatic AS' },
    { name: 'Gokstadakademiet' },
    { name: 'Husfliden' },
    { name: 'Kondomeriet' },
    { name: 'Kjells Markiser' },
  ]

  for (const partner of partners) {
    await payload.create({
      collection: 'partners',
      data: {
        name: partner.name,
        logo: placeholderMedia.id,
      },
    })
  }

  console.log(`${partners.length} partnere opprettet`)

  // -------------------------------------------------------
  // NEWS
  // -------------------------------------------------------

  const newsArticles: Omit<News, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>[] = [
    {
      title: 'Årssesongen 2025 er i gang',
      excerpt:
        'Båtklubben åpner offisielt for sesongen. Alle båter kan nå legges til kai, og bryggene er klargjort for sommeren.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Vi er glade for å ønske alle medlemmer velkommen til en ny sesong! Bryggene er ryddet, strøm og vann er koblet til, og klubbhuset er åpent fra og med denne helgen.',
                  version: 1,
                },
              ],
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Husk å møte opp på dugnad lørdag kl. 10:00 dersom du ikke allerede har meldt deg av. Vi trenger alle mann på dekk!',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      image: placeholderMedia.id,
      publishedAt: new Date('2025-04-15').toISOString(),
    },
    {
      title: 'Ny kyststi ferdigstilt langs havneområdet',
      excerpt:
        'Kommunen har ferdigstilt den nye kyststien som går forbi klubbens anlegg. Turen er nå tilgjengelig for alle.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Den nye kyststien strekker seg over 4 kilometer og gir fantastisk utsikt over fjorden. Prosjektet har vært etterlengtet av både medlemmer og naboer.',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      image: placeholderMedia.id,
      publishedAt: new Date('2025-03-20').toISOString(),
    },
    {
      title: 'Generalforsamling – referat og vedtak',
      excerpt:
        'Les referatet fra årets generalforsamling, inkludert vedtak om kontingent og valg av nytt styre.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Generalforsamlingen ble avholdt 5. mars med 34 stemmeberettigede tilstede. Styret ble gjenvalgt for ett nytt år, og kontingenten økes med 5% fra og med 2026.',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      image: placeholderMedia.id,
      publishedAt: new Date('2025-03-06').toISOString(),
    },
    {
      title: 'Kurs i navigasjon og sjøvett – påmelding åpen',
      excerpt:
        'Båtklubben tilbyr igjen kurs i navigasjon for nybegynnere og viderekomne. Plassene er begrenset.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Kurset går over tre kvelder og avsluttes med en praktisk prøvetur i fjorden. Instruktørene har lang erfaring og kurset passer for alle nivåer.',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      image: placeholderMedia.id,
      publishedAt: new Date('2025-02-10').toISOString(),
    },
    {
      title: 'Vintervedlikehold av brygger fullført',
      excerpt:
        'Styret melder at årets vintervedlikehold er gjennomført. Alle flyteelementer er inspisert og nødvendige reparasjoner utført.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Et dedikert team på 8 frivillige jobbet gjennom januar for å sikre at bryggene er i topp stand til sesongen. Takk til alle som bidro!',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          version: 1,
        },
      },
      image: placeholderMedia.id,
      publishedAt: new Date('2025-01-28').toISOString(),
    },
  ]

  for (const article of newsArticles) {
    await payload.create({
      collection: 'news',
      data: article,
    })
  }

  console.log(`${newsArticles.length} nyhetsartikler opprettet`)
  console.log('Seeding fullført!')
  process.exit(0)
}catch (error) {
    console.error('Feil:',error)
    process.exit(1)
  }
}

console.log('Kaller seed...')
seed().catch((err) => {
  console.error('Seeding feilet:', err)
  process.exit(1)
})

