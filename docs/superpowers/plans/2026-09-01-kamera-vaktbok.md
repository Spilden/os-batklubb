# Kamera-vaktbok Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let logged-in members log camera-watch checks ("kameravakt") through a simple form on `/members/vaktbok`, see prior entries (including imported history from the old WordPress vaktbok), and let admins review who has logged via Payload's built-in admin panel.

**Architecture:** One new Payload collection (`camera-log-entries`) holds every entry — both new "live" reports and imported historical rows, distinguished by a `source` field. The member page is a server component (auth guard + `payload.find`) rendering a client form component (React `useActionState` + a `'use server'` action, mirroring the existing `ContactForm`/`slipp` patterns) and a read-only list component. A one-off script imports the 4910 WordPress posts from `migration_data/vaktbok_logger.json` into the same collection.

**Tech Stack:** Next.js 16 (App Router, server actions), Payload CMS 3.79 (SQLite adapter), React 19, Tailwind, Vitest (`tests/int/**/*.int.spec.ts`).

**Spec:** `docs/superpowers/specs/2026-09-01-kamera-vaktbok-design.md`

## Global Constraints

- `camera-log-entries` requires an authenticated user for `read`, `create`, `update`, and `delete` (`Boolean(req.user)`) — unlike `slipp-bookings` / `clubhouse-bookings`, which stay open. This entry log determines who owes money for incomplete dugnad, so both reading and writing it through the public Payload REST/GraphQL API must be closed to anyone who isn't logged in. The page's own `if (!user) redirect(...)` check is additional, not a substitute — the Payload Local API calls in `page.tsx`/`actions.ts` use the default `overrideAccess: true` and so aren't gated by this block themselves, but every request that reaches them has already passed the page's own auth check.
- No digital vaktliste/turnusfordeling (duty roster) in this plan — logging only. Admin cross-checks manually against the external roster.
- `period` is always optional and never enforced against the actual clock — it's a soft label the user can freely override.
- All user-facing text is Norwegian (bokmål), matching the rest of the app.
- Follow existing file conventions exactly: collections in `src/collections/`, member pages as `page.tsx` + `actions.ts` under `src/app/(frontend)/members/<name>/`, shared UI in `src/components/`, one-off scripts in `src/scripts/`.

---

## Task 1: `camera-log-entries` collection

**Files:**
- Create: `src/collections/CameraLogEntries.ts`
- Modify: `src/payload.config.ts`
- Modify: `package.json` (no change needed yet — `generate:types` script already exists)
- Test: `tests/int/camera-log-entries.int.spec.ts`

**Interfaces:**
- Produces: Payload collection slug `'camera-log-entries'`, and after type generation, the TypeScript type `CameraLogEntry` in `@/payload-types` with shape `{ id: number; date: string; period?: ('morgen' | 'ettermiddag' | 'kveld') | null; user?: (number | User) | null; authorName: string; content: string; source: 'live' | 'imported'; createdAt: string; updatedAt: string }`. All later tasks import this type.

- [ ] **Step 1: Create the collection config**

`src/collections/CameraLogEntries.ts`:

```ts
import type { CollectionConfig } from 'payload'

export const CameraLogEntries: CollectionConfig = {
  slug: 'camera-log-entries',
  labels: {
    singular: 'Kameravaktlogg',
    plural: 'Kameravaktlogg',
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'user', 'period', 'date', 'source'],
    defaultSort: '-date',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'period',
      type: 'select',
      label: 'Periode',
      options: [
        { label: 'Morgen', value: 'morgen' },
        { label: 'Ettermiddag', value: 'ettermiddag' },
        { label: 'Kveld', value: 'kveld' },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Bruker',
    },
    {
      name: 'authorName',
      type: 'text',
      label: 'Navn',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Rapport',
      required: true,
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'live',
      options: [
        { label: 'Ny rapport', value: 'live' },
        { label: 'Importert historikk', value: 'imported' },
      ],
    },
  ],
}
```

- [ ] **Step 2: Register the collection**

In `src/payload.config.ts`, add the import next to the other collection imports:

```ts
import { CameraLogEntries } from '@/collections/CameraLogEntries'
```

And add `CameraLogEntries` to the `collections` array:

```ts
collections: [
  Users,
  Media,
  News,
  Partners,
  ContactSubmissions,
  SlippBookings,
  ClubhouseBookings,
  Events,
  CameraLogEntries,
],
```

- [ ] **Step 3: Regenerate Payload types**

Run: `npm run generate:types`
Expected: `src/payload-types.ts` now contains `export interface CameraLogEntry { ... }` with the fields from Step 1.

- [ ] **Step 4: Write the schema test**

`tests/int/camera-log-entries.int.spec.ts`:

```ts
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let createdId: number

describe('camera-log-entries collection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    if (createdId) {
      await payload.delete({
        collection: 'camera-log-entries',
        where: { id: { equals: createdId } },
      })
    }
  })

  it('creates an entry with required fields and defaults the source to live', async () => {
    const entry = await payload.create({
      collection: 'camera-log-entries',
      data: {
        date: new Date().toISOString(),
        authorName: 'Test Testesen',
        content: 'Alt i orden',
      },
    })
    createdId = entry.id

    expect(entry.authorName).toBe('Test Testesen')
    expect(entry.content).toBe('Alt i orden')
    expect(entry.source).toBe('live')
    expect(entry.user).toBeFalsy()
    expect(entry.period).toBeFalsy()
  })

  it('rejects create for an unauthenticated request', async () => {
    await expect(
      payload.create({
        collection: 'camera-log-entries',
        overrideAccess: false,
        data: {
          date: new Date().toISOString(),
          authorName: 'Uinnlogget',
          content: 'Skal ikke gå gjennom',
        },
      }),
    ).rejects.toThrow()
  })

  it('rejects read for an unauthenticated request', async () => {
    await expect(
      payload.find({ collection: 'camera-log-entries', overrideAccess: false }),
    ).rejects.toThrow()
  })
})
```

The first test (`creates an entry with required fields...`) uses the Local API's default `overrideAccess: true`, so it is unaffected by the new `access` block — that's intentional, it's testing the schema, not the access rules. The two new tests explicitly opt back into access checking with `overrideAccess: false` to prove `read` and `create` actually reject an unauthenticated request now that the collection requires one.

- [ ] **Step 5: Run the test**

Run: `npx vitest run --config ./vitest.config.mts tests/int/camera-log-entries.int.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/collections/CameraLogEntries.ts src/payload.config.ts tests/int/camera-log-entries.int.spec.ts
git commit -m "feat: add camera-log-entries collection"
```

**Note:** `src/payload-types.ts` is listed in `.gitignore` and regenerated by `npm run generate:types` — do not `git add` it. Every later task that imports `CameraLogEntry` from `@/payload-types` relies on this file existing on disk (from Step 3's run), not on it being committed.

---

## Task 2: Import helper functions (pure, TDD)

**Files:**
- Create: `src/scripts/vaktbok-import-helpers.ts`
- Test: `tests/int/vaktbok-import-helpers.int.spec.ts`

**Interfaces:**
- Produces: `stripHtml(html: string): string`, `guessPeriod(title: string): 'morgen' | 'ettermiddag' | 'kveld' | undefined`, `buildReportText(title: string, contentHtml: string): string`. Consumed by Task 3.

- [ ] **Step 1: Write the failing tests**

`tests/int/vaktbok-import-helpers.int.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { stripHtml, guessPeriod, buildReportText } from '@/scripts/vaktbok-import-helpers'

describe('stripHtml', () => {
  it('removes tags and decodes common entities', () => {
    expect(
      stripHtml(
        '<p class="wp-block-paragraph">stille rolig. 2 biler parkering nede. Litt regn.&nbsp;</p>',
      ),
    ).toBe('stille rolig. 2 biler parkering nede. Litt regn.')
  })

  it('returns an empty string for empty input', () => {
    expect(stripHtml('')).toBe('')
  })
})

describe('guessPeriod', () => {
  it('detects morgen', () => {
    expect(guessPeriod('TIRSDAG MORGEN 01.09.26')).toBe('morgen')
  })

  it('detects formiddag as morgen', () => {
    expect(guessPeriod('Formiddagsrunde 01.09.26')).toBe('morgen')
  })

  it('detects ettermiddag', () => {
    expect(guessPeriod('ettermiddag tirsdag 01.09.26')).toBe('ettermiddag')
  })

  it('detects a standalone "dag" as ettermiddag', () => {
    expect(guessPeriod('vakt dag.')).toBe('ettermiddag')
  })

  it('prefers ettermiddag over the standalone-dag fallback', () => {
    expect(guessPeriod('mandag ettermiddag. 31.08.26')).toBe('ettermiddag')
  })

  it('detects kveld', () => {
    expect(guessPeriod('Kveld 30.')).toBe('kveld')
  })

  it('detects natt as kveld', () => {
    expect(guessPeriod('Nattevakt 01.09.26')).toBe('kveld')
  })

  it('returns undefined when no keyword matches', () => {
    expect(guessPeriod('stille rolig')).toBeUndefined()
  })
})

describe('buildReportText', () => {
  it('combines title and stripped content when content exists', () => {
    expect(buildReportText('ettermiddag tirsdag', '<p>stille rolig</p>')).toBe(
      'ettermiddag tirsdag\n\nstille rolig',
    )
  })

  it('falls back to the title alone when content is empty', () => {
    expect(buildReportText('vakt morgen', '')).toBe('vakt morgen')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --config ./vitest.config.mts tests/int/vaktbok-import-helpers.int.spec.ts`
Expected: FAIL — `Cannot find module '@/scripts/vaktbok-import-helpers'`

- [ ] **Step 3: Implement the helpers**

`src/scripts/vaktbok-import-helpers.ts`:

```ts
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

type Period = 'morgen' | 'ettermiddag' | 'kveld'

const PERIOD_KEYWORDS: Array<{ pattern: RegExp; period: Period }> = [
  { pattern: /formiddag/i, period: 'morgen' },
  { pattern: /morgen/i, period: 'morgen' },
  { pattern: /ettermiddag/i, period: 'ettermiddag' },
  { pattern: /\bdag\b/i, period: 'ettermiddag' },
  { pattern: /kveld/i, period: 'kveld' },
  { pattern: /natt/i, period: 'kveld' },
]

export function guessPeriod(title: string): Period | undefined {
  for (const { pattern, period } of PERIOD_KEYWORDS) {
    if (pattern.test(title)) return period
  }
  return undefined
}

export function buildReportText(title: string, contentHtml: string): string {
  const cleanTitle = title.trim()
  const cleanContent = stripHtml(contentHtml)
  return cleanContent ? `${cleanTitle}\n\n${cleanContent}` : cleanTitle
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --config ./vitest.config.mts tests/int/vaktbok-import-helpers.int.spec.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add src/scripts/vaktbok-import-helpers.ts tests/int/vaktbok-import-helpers.int.spec.ts
git commit -m "feat: add vaktbok import parsing helpers"
```

---

## Task 3: Import logic + CLI script

**Files:**
- Create: `src/scripts/vaktbok-import.ts`
- Create: `src/scripts/import-vaktbok.ts`
- Modify: `package.json` (add `import:vaktbok` script)
- Test: `tests/int/vaktbok-import.int.spec.ts`

**Interfaces:**
- Consumes: `stripHtml`, `guessPeriod`, `buildReportText` from Task 2; collection slug `'camera-log-entries'` from Task 1.
- Produces: `type WpVaktbokPost`, `parseWpPost(post: WpVaktbokPost): ParsedVaktbokEntry | null`, `importVaktbokPosts(payload: Payload, posts: WpVaktbokPost[]): Promise<number>` — all exported from `src/scripts/vaktbok-import.ts`. Not consumed elsewhere in the app (CLI-only), but kept in a separate testable module from the CLI entry point.

- [ ] **Step 1: Write the failing tests**

`tests/int/vaktbok-import.int.spec.ts`:

```ts
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterEach, expect } from 'vitest'
import { importVaktbokPosts, parseWpPost, type WpVaktbokPost } from '@/scripts/vaktbok-import'

let payload: Payload

const fixturePosts: WpVaktbokPost[] = [
  {
    status: 'publish',
    date: '2026-09-01T17:43:33',
    title: { rendered: 'ettermiddag tirsdag 01.09.26' },
    content: { rendered: '<p class="wp-block-paragraph">stille rolig.&nbsp;</p>' },
    author: 73,
    _embedded: { author: [{ name: 'Bjørg Frotveit' }] },
  },
  {
    status: 'publish',
    date: '2026-08-09T09:23:21',
    title: { rendered: 'vakt morgen' },
    content: { rendered: '' },
    author: 10,
  },
  {
    status: 'draft',
    date: '2026-08-01T09:00:00',
    title: { rendered: 'skal ikke importeres' },
    content: { rendered: '' },
    author: 10,
  },
]

describe('parseWpPost', () => {
  it('parses a post with content and a known author name', () => {
    const entry = parseWpPost(fixturePosts[0])
    expect(entry).toMatchObject({
      authorName: 'Bjørg Frotveit',
      period: 'ettermiddag',
      content: 'ettermiddag tirsdag 01.09.26\n\nstille rolig.',
      source: 'imported',
    })
  })

  it('falls back to a placeholder author name when the embed is missing', () => {
    const entry = parseWpPost(fixturePosts[1])
    expect(entry?.authorName).toBe('Bruker 10')
    expect(entry?.content).toBe('vakt morgen')
  })

  it('returns null for non-published posts', () => {
    expect(parseWpPost(fixturePosts[2])).toBeNull()
  })
})

describe('importVaktbokPosts', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(async () => {
    await payload.delete({
      collection: 'camera-log-entries',
      where: { source: { equals: 'imported' } },
    })
  })

  it('creates one entry per publishable post and skips the rest', async () => {
    const created = await importVaktbokPosts(payload, fixturePosts)
    expect(created).toBe(2)

    const { docs } = await payload.find({
      collection: 'camera-log-entries',
      where: { source: { equals: 'imported' } },
    })
    expect(docs).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --config ./vitest.config.mts tests/int/vaktbok-import.int.spec.ts`
Expected: FAIL — `Cannot find module '@/scripts/vaktbok-import'`

- [ ] **Step 3: Implement the import logic**

`src/scripts/vaktbok-import.ts`:

```ts
import type { Payload } from 'payload'
import { stripHtml, guessPeriod, buildReportText } from './vaktbok-import-helpers'

export type WpVaktbokPost = {
  status: string
  date: string
  title: { rendered: string }
  content: { rendered: string }
  author: number
  _embedded?: { author?: Array<{ name?: string }> }
}

export type ParsedVaktbokEntry = {
  date: string
  period?: 'morgen' | 'ettermiddag' | 'kveld'
  authorName: string
  content: string
  source: 'imported'
}

export function parseWpPost(post: WpVaktbokPost): ParsedVaktbokEntry | null {
  if (post.status !== 'publish') return null

  const title = post.title.rendered
  const authorName = post._embedded?.author?.[0]?.name || `Bruker ${post.author}`
  const period = guessPeriod(title)

  return {
    date: new Date(post.date).toISOString(),
    ...(period ? { period } : {}),
    authorName,
    content: buildReportText(title, post.content.rendered),
    source: 'imported',
  }
}

export async function importVaktbokPosts(payload: Payload, posts: WpVaktbokPost[]): Promise<number> {
  let created = 0
  for (const post of posts) {
    const entry = parseWpPost(post)
    if (!entry) continue
    await payload.create({ collection: 'camera-log-entries', data: entry })
    created += 1
  }
  return created
}
```

Note: `stripHtml` in `buildReportText` also decodes `&nbsp;` etc., which is why the expected content in the test above ends with `stille rolig.` (trailing `&nbsp;` collapsed to nothing after trim).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --config ./vitest.config.mts tests/int/vaktbok-import.int.spec.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Write the CLI entry point**

`src/scripts/import-vaktbok.ts`:

```ts
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
```

- [ ] **Step 6: Add the npm script**

In `package.json`, add next to `"seed"`:

```json
"import:vaktbok": "npx tsx src/scripts/import-vaktbok.ts"
```

- [ ] **Step 7: Commit**

```bash
git add src/scripts/vaktbok-import.ts src/scripts/import-vaktbok.ts tests/int/vaktbok-import.int.spec.ts package.json
git commit -m "feat: add vaktbok history import script"
```

**Note:** Do not run `npm run import:vaktbok` against the real dev database as part of this task — that's a one-time, separate operation the user runs deliberately once the feature is live (it writes ~4000+ rows). This task only proves the logic works via the fixture-based test above.

---

## Task 4: `createVaktbokEntry` + server action

**Files:**
- Create: `src/app/(frontend)/members/vaktbok/createEntry.ts`
- Create: `src/app/(frontend)/members/vaktbok/actions.ts`
- Test: `tests/int/vaktbok-create-entry.int.spec.ts`

**Interfaces:**
- Consumes: `CameraLogEntry` type and `'camera-log-entries'` slug from Task 1.
- Produces: `createVaktbokEntry(payload: Payload, input: { userId: number; userName: string; content: string; period?: string }): Promise<CameraLogEntry>` (throws `Error('Rapporten kan ikke være tom')` on blank content). `submitVaktbokEntry(prevState: unknown, formData: FormData): Promise<{ success: boolean; error: string }>` — the `'use server'` action, same signature shape as the existing `submitContactForm`. Consumed by Task 5's `VaktbokForm`.

- [ ] **Step 1: Write the failing test**

`tests/int/vaktbok-create-entry.int.spec.ts`:

```ts
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import { createVaktbokEntry } from '@/app/(frontend)/members/vaktbok/createEntry'

let payload: Payload
let testUserId: number

describe('createVaktbokEntry', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'vaktbok-test@example.com',
        name: 'Test Testesen',
        password: 'test1234',
        roles: ['member'],
      },
    })
    testUserId = user.id
  })

  afterEach(async () => {
    await payload.delete({
      collection: 'camera-log-entries',
      where: { source: { equals: 'live' } },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', where: { id: { equals: testUserId } } })
  })

  it('creates a live entry with the given content and period', async () => {
    const entry = await createVaktbokEntry(payload, {
      userId: testUserId,
      userName: 'Test Testesen',
      content: '  Alt i orden  ',
      period: 'kveld',
    })

    expect(entry.authorName).toBe('Test Testesen')
    expect(entry.content).toBe('Alt i orden')
    expect(entry.period).toBe('kveld')
    expect(entry.source).toBe('live')
  })

  it('omits period when it is not one of the known values', async () => {
    const entry = await createVaktbokEntry(payload, {
      userId: testUserId,
      userName: 'Test Testesen',
      content: 'Alt i orden',
      period: 'ikke-en-periode',
    })

    expect(entry.period).toBeFalsy()
  })

  it('throws when content is empty after trimming', async () => {
    await expect(
      createVaktbokEntry(payload, { userId: testUserId, userName: 'Test Testesen', content: '   ' }),
    ).rejects.toThrow('Rapporten kan ikke være tom')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --config ./vitest.config.mts tests/int/vaktbok-create-entry.int.spec.ts`
Expected: FAIL — `Cannot find module '@/app/(frontend)/members/vaktbok/createEntry'`

- [ ] **Step 3: Implement `createVaktbokEntry`**

`src/app/(frontend)/members/vaktbok/createEntry.ts`:

```ts
import type { Payload } from 'payload'
import type { CameraLogEntry } from '@/payload-types'

const VALID_PERIODS = ['morgen', 'ettermiddag', 'kveld'] as const
type Period = (typeof VALID_PERIODS)[number]

export type CreateVaktbokEntryInput = {
  userId: number
  userName: string
  content: string
  period?: string
}

export async function createVaktbokEntry(
  payload: Payload,
  input: CreateVaktbokEntryInput,
): Promise<CameraLogEntry> {
  const content = input.content.trim()
  if (!content) {
    throw new Error('Rapporten kan ikke være tom')
  }

  const period =
    input.period && (VALID_PERIODS as readonly string[]).includes(input.period)
      ? (input.period as Period)
      : undefined

  return payload.create({
    collection: 'camera-log-entries',
    data: {
      date: new Date().toISOString(),
      ...(period ? { period } : {}),
      user: input.userId,
      authorName: input.userName,
      content,
      source: 'live',
    },
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --config ./vitest.config.mts tests/int/vaktbok-create-entry.int.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the server action**

`src/app/(frontend)/members/vaktbok/actions.ts`:

```ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createVaktbokEntry } from './createEntry'

export async function submitVaktbokEntry(_prevState: unknown, formData: FormData) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return { success: false, error: 'Du må være innlogget' }
  }

  const content = formData.get('content') as string
  const period = formData.get('period') as string

  try {
    await createVaktbokEntry(payload, {
      userId: user.id,
      userName: user.name,
      content,
      period,
    })
    revalidatePath('/members/vaktbok')
    return { success: true, error: '' }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Noe gikk galt, prøv igjen senere',
    }
  }
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors from the two new files.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(frontend)/members/vaktbok/createEntry.ts" "src/app/(frontend)/members/vaktbok/actions.ts" tests/int/vaktbok-create-entry.int.spec.ts
git commit -m "feat: add vaktbok entry creation logic and server action"
```

---

## Task 5: `VaktbokForm` component

**Files:**
- Create: `src/components/VaktbokForm.tsx`

**Interfaces:**
- Consumes: `submitVaktbokEntry` from Task 4 (`src/app/(frontend)/members/vaktbok/actions.ts`), `BaseButton` from `src/components/BaseButton.tsx`.
- Produces: `VaktbokForm` (named export, no props) — a client component. Consumed by Task 6's `page.tsx`.

- [ ] **Step 1: Implement the component**

`src/components/VaktbokForm.tsx`:

```tsx
'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitVaktbokEntry } from '@/app/(frontend)/members/vaktbok/actions'
import BaseButton from '@/components/BaseButton'

const initialState = {
  success: false,
  error: '',
}

const PERIODS: Array<{ value: string; label: string }> = [
  { value: 'morgen', label: 'Morgen' },
  { value: 'ettermiddag', label: 'Ettermiddag' },
  { value: 'kveld', label: 'Kveld' },
]

function guessCurrentPeriod(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'morgen'
  if (hour < 18) return 'ettermiddag'
  return 'kveld'
}

export function VaktbokForm() {
  const [state, action, isPending] = useActionState(submitVaktbokEntry, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [period, setPeriod] = useState(guessCurrentPeriod())
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  useEffect(() => {
    if (isPending) {
      setShowToast(null)
    }
    if (state.success) {
      formRef.current?.reset()
      setPeriod(guessCurrentPeriod())
      setShowToast({ type: 'success', message: 'Rapport lagret, takk!' })
      setTimeout(() => setShowToast(null), 5000)
    }
    if (state.error) {
      setShowToast({ type: 'error', message: state.error })
      setTimeout(() => setShowToast(null), 5000)
    }
  }, [isPending, state.success, state.error])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      {showToast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg p-4 shadow-lg flex items-start gap-4 w-56
    ${
      showToast.type === 'success'
        ? 'bg-green-100 border border-green-500 text-green-700'
        : 'bg-red-100 border border-red-500 text-red-700'
    }`}
        >
          <span>{showToast.message}</span>
          <button
            type="button"
            onClick={() => setShowToast(null)}
            className="font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 text-text font-medium text-sm uppercase">
        <label>Periode</label>
        <div className="flex gap-3">
          {PERIODS.map((p) => (
            <label
              key={p.value}
              className="flex items-center gap-2 cursor-pointer border border-ocean rounded-lg px-4 py-2 has-checked:bg-ocean has-checked:text-surface transition-colors"
            >
              <input
                type="radio"
                name="period"
                value={p.value}
                checked={period === p.value}
                onChange={() => setPeriod(p.value)}
                className="sr-only"
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-text font-medium text-sm uppercase">
          Rapport
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={4}
          placeholder="Alt i orden"
          className="border border-ocean rounded-lg p-2 bg-background text-text focus:outline-none focus:ring-2 focus:ring-ocean resize-none"
        />
      </div>

      <div className="flex justify-end">
        <BaseButton type="submit" disabled={isPending}>
          {isPending ? 'Lagrer...' : 'Lagre rapport'}
        </BaseButton>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/VaktbokForm.tsx
git commit -m "feat: add VaktbokForm component"
```

---

## Task 6: `VaktbokList` component + `/members/vaktbok` page

**Files:**
- Create: `src/components/VaktbokList.tsx`
- Create: `src/app/(frontend)/members/vaktbok/page.tsx`

**Interfaces:**
- Consumes: `CameraLogEntry` type from Task 1, `VaktbokForm` from Task 5, `BaseButton` from `src/components/BaseButton.tsx`.
- Produces: `VaktbokList` (named export, props `{ entries: CameraLogEntry[] }`) and the page at route `/members/vaktbok`.

- [ ] **Step 1: Implement the list component**

`src/components/VaktbokList.tsx`:

```tsx
import type { CameraLogEntry } from '@/payload-types'

const PERIOD_LABELS: Record<string, string> = {
  morgen: 'Morgen',
  ettermiddag: 'Ettermiddag',
  kveld: 'Kveld',
}

function formatEntryDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}

export function VaktbokList({ entries }: { entries: CameraLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-text-muted">Ingen rapporter funnet.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.id} className="bg-surface rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-text-muted text-sm uppercase">
            <span>{entry.authorName}</span>
            <span>
              {formatEntryDate(entry.date)}
              {entry.period ? ` · ${PERIOD_LABELS[entry.period]}` : ''}
            </span>
          </div>
          <p className="text-text whitespace-pre-line pt-2">{entry.content}</p>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Implement the page**

`src/app/(frontend)/members/vaktbok/page.tsx`:

```tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { VaktbokForm } from '@/components/VaktbokForm'
import { VaktbokList } from '@/components/VaktbokList'
import BaseButton from '@/components/BaseButton'

const DAYS_IN_DEFAULT_VIEW = 30
const PAGE_SIZE = 20

export default async function VaktbokPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const { page: pageParam } = await searchParams
  const page = pageParam ? Number(pageParam) : 1
  const isPaginatedView = page > 1

  const result = isPaginatedView
    ? await payload.find({
        collection: 'camera-log-entries',
        sort: '-date',
        limit: PAGE_SIZE,
        page,
        depth: 0,
      })
    : await payload.find({
        collection: 'camera-log-entries',
        sort: '-date',
        limit: 50,
        depth: 0,
        where: {
          date: {
            greater_than_equal: new Date(
              Date.now() - DAYS_IN_DEFAULT_VIEW * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        },
      })

  return (
    <div className="w-full flex flex-col gap-8">
      <h1 className="text-text font-display text-center text-3xl p-10">Kameravaktbok</h1>
      <VaktbokForm />
      <div className="flex flex-col gap-4">
        <h2 className="text-text font-display text-xl">
          {isPaginatedView ? 'Historikk' : `Siste ${DAYS_IN_DEFAULT_VIEW} dager`}
        </h2>
        <VaktbokList entries={result.docs} />
        <div className="flex justify-center gap-4">
          {isPaginatedView && result.hasPrevPage && (
            <BaseButton href={`/members/vaktbok?page=${page - 1}`} variant="text">
              Forrige
            </BaseButton>
          )}
          {!isPaginatedView && (
            <BaseButton href="/members/vaktbok?page=2" variant="text">
              Vis eldre
            </BaseButton>
          )}
          {isPaginatedView && result.hasNextPage && (
            <BaseButton href={`/members/vaktbok?page=${page + 1}`} variant="text">
              Neste
            </BaseButton>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, log in as a member (see `README.md` for admin credentials, or use a seeded member account), visit `/members/vaktbok`:
- Submit a report with the default period pre-selected → it appears at the top of the list immediately, form clears, success toast shows.
- Submit with an empty report → browser's native `required` validation blocks submission (textarea has `required`).
- Switch periods before submitting → the saved entry shows the period you picked, not the pre-selected one.
- Visit while logged out → redirected to `/admin/login`.

- [ ] **Step 5: Commit**

```bash
git add src/components/VaktbokList.tsx "src/app/(frontend)/members/vaktbok/page.tsx"
git commit -m "feat: add vaktbok page with report list and pagination"
```

---

## Task 7: Navigation links

**Files:**
- Modify: `src/app/(frontend)/members/layout.tsx`

**Interfaces:**
- Consumes: existing `BaseButton` and `NavButton` components, route `/members/vaktbok` from Task 6.

- [ ] **Step 1: Add the mobile nav link**

In `src/app/(frontend)/members/layout.tsx`, add a fourth link inside the `<nav className="flex lg:hidden">` block, after the "Klubbhus" button:

```tsx
        <BaseButton href="/members/vaktbok" variant="text" className="flex-1 text-center p-3 text-sm">
          Vaktbok
        </BaseButton>
```

- [ ] **Step 2: Add the desktop nav link**

In the same file, add inside the `<aside>` block's `<div className="flex flex-col ...">`, after the "Klubbhus" `NavButton`:

```tsx
          <NavButton href="/members/vaktbok">Vaktbok</NavButton>
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, log in, confirm "Vaktbok" appears in both the mobile nav bar and the desktop sidebar, and clicking it navigates to `/members/vaktbok`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(frontend)/members/layout.tsx"
git commit -m "feat: add vaktbok link to members navigation"
```

---

## After all tasks

Once all 7 tasks are merged, run the full test suite once to confirm nothing regressed:

Run: `npm run test:int`
Expected: all tests pass, including the new `camera-log-entries`, `vaktbok-import-helpers`, `vaktbok-import`, and `vaktbok-create-entry` specs.

The historical import (`npm run import:vaktbok`) is a separate, deliberate one-time operation against the real production/dev database — run it manually when ready to go live, not as part of this implementation work.
