console.log('Importerer nyheter')
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { prepareNewsPosts, importNewsPosts, type RawNewsPost } from './news-import'

function readSource(filename: string): RawNewsPost[] {
  const filePath = path.resolve(process.cwd(), 'migration_data', filename)
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as RawNewsPost[]
}

async function run() {
  const { posts, skipped } = prepareNewsPosts([
    { posts: readSource('varganytt_nyheter1.json'), imageDir: 'varganytt_bilder1' },
    { posts: readSource('varganytt_nyheter2.json'), imageDir: 'varganytt_bilder2' },
  ])

  const payload = await getPayload({ config })
  const { created, alreadyExisted, missingImages } = await importNewsPosts(payload, posts)

  console.log(`Opprettet ${created} nye nyhetsartikler`)
  console.log(`${alreadyExisted} fantes allerede (tittel i bruk)`)
  console.log(`${missingImages} artikler manglet bildefil på disk`)
  if (skipped.length > 0) {
    console.log(`Hoppet over ${skipped.length} innlegg fra kilden:`)
    for (const s of skipped) {
      console.log(`  ${s.source}/post_${s.id}: ${s.reason}`)
    }
  }
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
