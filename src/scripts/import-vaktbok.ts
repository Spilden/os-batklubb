console.log('Importerer vaktbok-historikk')
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { importVaktbokPosts, type WpVaktbokPost } from './vaktbok-import'

async function run() {
  const filePath = path.resolve(process.cwd(), 'migration_data/vaktbok_logger.json')
  const posts = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as WpVaktbokPost[]

  const payload = await getPayload({ config })
  const created = await importVaktbokPosts(payload, posts)

  console.log(`Importerte ${created} av ${posts.length} innlegg`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
