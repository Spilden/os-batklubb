console.log('Scriptet starter')
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { News } from '@/payload-types'
import fs from 'fs'

async function seed() {
  try {
    // -------------------------------------------------------
    // SLETT DATABASE
    // -------------------------------------------------------

    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './os-baatklubb.db'

    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
      console.log('Database slettet')
    }

    const payload = await getPayload({ config })

    console.log('Starter seeding...')

    // -------------------------------------------------------
    // SEED ADMIN BRUKER
    // -------------------------------------------------------

    const adminEmail = process.env.SEED_ADMIN_EMAIL
    const adminPassword = process.env.SEED_ADMIN_PASSWORD

    if (adminEmail && adminPassword) {
      await payload.create({
        collection: 'users',
        data: {
          email: adminEmail,
          password: adminPassword,
        },
      })
      console.log('Admin bruker opprettet')
    } else {
      console.log('Ingen admin bruker seedet, mangler epost og passord i env filen')
    }

    // -------------------------------------------------------
    // MEDIA – placeholder-bilde
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // ABOUT
    // -------------------------------------------------------

    await payload.updateGlobal({
      slug: 'about',
      data: {
        title: 'Klubbens Historie',
        image: placeholderMedia.id,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text:
                      'Alle som hadde båt i Os ble invitert til å være med i den nystartede foreningen. 16 personer deltok på etableringsmøtet og Jon Lundetræ ble klubbens første formann.\n' +
                      'Sammen med lensmann Bjarne Dahl var Ingvald Njøten og Jon Lundetræ den bærende kraft i klubben de første årene.\n' +
                      'På møtet i "Os Motorbåtlag" 17.03.1955 ble navnet endret til Os Båtklubb mot to stemmer:\n' +
                      '\n' +
                      'I 1962 fikk klubben bygslet tomt i Vargavågen av Engel Lunde. Og naust ble innkjøpt med private midler fra lensmann Bjarne Dahl. Det kostet hele 400 kroner. Naustet ble satt opp, skinnegang kom på plass og det ble utarbeidet område for vinteropplag og kaiområde. Naust, opplagsplass og kai sto ferdig i mai 1969.\n' +
                      'En imponerende innsats ble lagt ned i klubbens første 10–15 år. Et solid grunnlag å bygge videre på.\n' +
                      '\n' +
                      'I 1974 fikk de utvidet tomtearealet i Varga samtidig som de kjøpte tomten. Vi ble grunneiere i Vargavågen, noe som viste seg å bli helt avgjørende for klubbens videre utvikling i Varga.\n' +
                      'Året etter – i 1975 ble det forhandlet frem en bygselavtale med 4 grunneiere for å anlegge vei ned til klubbens tomteland. Allerede senhøstes samme året var veitraséen stukket, og før jul var ryddingen i gang. Veien er ca. 600 meter lang og ble en tung investering. Klubben hadde 30.000 i egne midler, medlemmene ga et lån på 50.000 og Os kommune tilsvarende 50.000 pluss dugnad.\n' +
                      '\n' +
                      'I 2013 utvidet vi anlegget fra 78 båtplasser til 102 båtplasser i flytebrygger.\n' +
                      'De ble lagt ut ny brygge C, og oppgraderte brygge A og B med nytt dekke og nye strøysøyler og strømkontakter for alle brygger.\n' +
                      'Overvåknings kamera over bom, parkeringsplass og alle brygger ble montert i 2014.\n' +
                      'Tak over slipp ble montert i mars 2015.\n' +
                      '\n' +
                      'Klubben har i dag 141 medlemmer.\n' +
                      '\n' +
                      'Naustet vårt inneholder klubblokaler, kjøkken, dusj, toalett og naust.\n' +
                      '\n' +
                      'Gjester i båthavnen har tilgang til strøm, vaskemaskin, tørketrommel, dusj og toalett.\n' +
                      '\n' +
                      'Se oppslag i havnen.',
                    version: 1,
                  },
                ],
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
      },
    })

    console.log('About seksjon opprettet')

    // -------------------------------------------------------
    // GUEST MARINA
    // -------------------------------------------------------

    await payload.updateGlobal({
      slug: 'guestMarina',
      data: {
        title: 'Vargavågen Gjestehavn',
        price: 150,
        paymentInfo: 'Vipps til 128382 – Os Båtklubb',
        image: placeholderMedia.id,
        facilities: [
          { facility: 'Sanitæranlegg med toalett og dusj' },
          { facility: 'Vaskemaskin og tørketrommel' },
          { facility: 'Grillhytte tilgjengelig for gjester' },
          { facility: 'Egen badestrand' },
          { facility: 'Slipp – bestilling av slipping kan gjøres på forespørsel' },
          { facility: 'Høytrykkspyler kan leies ved behov' },
        ],
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Vargavågen er en fredelig og godt beskyttet havn, skjermet mot vær og vind. Her finner du rolige og idylliske omgivelser – perfekt for deg som ønsker å legge til i en naturskjønn og historisk rik del av kysten.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Havnen har 8 faste gjesteplasser, og flere plasser kan benyttes ved behov.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    text: 'Historikk',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Vargavågen er et område med rik historie. I nærheten finner du flere historiske severdigheter, blant annet Vargahålo som er synlig fra havnen, helleristningsfelt og klebersteinbrudd fra steinalderen.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    text: 'Turterreng',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Området byr på fine turmuligheter for deg som vil utforske naturen til fots.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    text: 'Praktisk informasjon',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Det er ingen butikk i umiddelbar nærhet, men det finnes en kiosk på Halhjem fergekai. Nærmeste dagligvarebutikk er Kiwi Moberg, ca. 4 km unna.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
      },
    })

    console.log('GuestMarina opprettet')
    console.log('Seeding fullført!')
    process.exit(0)
  } catch (error) {
    console.error('Feil:', error)
    process.exit(1)
  }
}

console.log('Kaller seed...')
seed().catch((err) => {
  console.error('Seeding feilet:', err)
  process.exit(1)
})
