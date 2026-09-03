console.log('Importerer medlemmer')
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { importMembers, parseMembersCsv } from './member-import'

async function run() {
  const filePath = path.resolve(process.cwd(), 'migration_data/Detaljert_medlem_Rapport.csv')
  const content = fs.readFileSync(filePath, 'utf-8')
  const { members, skipped } = parseMembersCsv(content)

  const payload = await getPayload({ config })
  const { created, alreadyExisted } = await importMembers(payload, members)

  console.log(`Opprettet ${created} nye medlemmer`)
  console.log(`${alreadyExisted} fantes allerede (e-post i bruk)`)
  if (skipped.length > 0) {
    console.log(`Hoppet over ${skipped.length} rader:`)
    for (const s of skipped) {
      console.log(`  Rad ${s.row}: ${s.reason}`)
    }
  }
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
