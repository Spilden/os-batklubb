# Kamera-vaktbok — design

**Status:** Godkjent av bruker (design), venter på spec-review
**Dato:** 2026-09-01

## Bakgrunn

Medlemmer med kameravakt skal sjekke overvåkningskameraene 3 ganger i
døgnet og rapportere det. I dag skjer dette i en ekstern WordPress-side
(vaktbok.osbaatklubb.org) hvis innhold ligger eksportert i
`migration_data/vaktbok_logger.json` (4910 innlegg). Ved årsslutt
sjekker en admin manuelt hvem som ikke har ført logg, og de personene
må betale for ikke fullført dugnad.

Hvem som *har* kameravakt når (vaktlisten/turnusen) bestemmes i dag
utenfor systemet (papir/manuelt), og er **ikke** en del av denne
leveransen. Denne funksjonen dekker kun **loggføring** av utførte
sjekker, pluss en admin-oversikt over hva som er logget. En fremtidig
utvidelse kan legge til digital vaktfordeling — se «Fremtidig arbeid».

## Mål

- Medlemmer kan på en ekstremt enkel måte rapportere at de har sjekket
  kamera, og se hva som er rapportert tidligere (både ferske og
  historiske oppføringer).
- Admin kan, uten egen utviklet kode, filtrere/sortere loggførte
  oppføringer per bruker og dato for å sammenligne mot den eksterne
  vaktlisten.
- Historikken fra den gamle vaktboken (4910 WP-innlegg) er tilgjengelig
  i appen som skrivebeskyttet historikk, slik at kontinuiteten
  bevares.

## Ikke-mål

- Digital vaktliste/turnusstyring (hvem *skal* ha vakt når) — eksternt
  system i dag, egen fremtidig funksjon.
- Automatisk beregning av hvem som «ikke har fullført dugnad» — krever
  vaktlisten over, som ikke finnes digitalt ennå. Admin gjør denne
  vurderingen manuelt basert på loggdataene.
- Redigering/sletting av egne innlegg fra medlemssiden (kun via
  `/admin` av en admin, ved behov for korrigering).
- Varsling/påminnelser om at kamera bør sjekkes.

## Datamodell

Ny Payload-collection: `camera-log-entries` (norsk admin-label
«Kameravaktlogg»).

| Felt | Type | Påkrevd | Beskrivelse |
|---|---|---|---|
| `date` | `date` (dayAndTime picker) | Ja | Tidspunktet sjekken gjelder. Settes automatisk til innsendingstidspunkt for nye rapporter (satt av server action, ikke av bruker). Ved import settes den til WP-postens opprinnelige `date`. |
| `period` | `select`: `morgen` / `ettermiddag` / `kveld` | Nei | Myk merking av hvilken av de tre daglige sjekkene rapporten gjelder. Ikke låst til klokkeslett — forhåndsvalgt i UI ut fra `date`, men fritt redigerbart. Kan være tom (særlig for eldre importerte rader hvor periode ikke kunne gjettes). |
| `user` | `relationship` → `users` | Nei | Satt for alle nye rapporter (innlogget bruker). Tom for importerte historiske rader (gamle WP-brukere matcher ikke nødvendigvis Payload-brukere). |
| `authorName` | `text` | Ja | Visningsnavn for oppføringen. Ved ny rapport: `user.name` på innsendingstidspunktet. Ved import: WP-forfatterens navn. Lar listevisningen vise forfatter uten ekstra oppslag, og fungerer identisk for importerte og nye rader. |
| `content` | `textarea` | Ja | Selve rapportteksten. |
| `source` | `select`: `live` / `imported` | Nei (`defaultValue: 'live'`, ikke `required` — se merknad under) | Skiller nye rapporter fra historikk. Brukes til filtrering i admin-panelet og til å style historiske rader annerledes i listevisningen om ønskelig. |

**Admin-konfig på collectionen:**
```ts
defaultSort: '-date', // toppnivå på CollectionConfig, ikke inni admin
admin: {
  useAsTitle: 'authorName',
  defaultColumns: ['authorName', 'user', 'period', 'date', 'source'],
}
```

**Merknad om `source` og `required`:** feltet har bevisst ikke
`required: true`, selv om det alltid har en verdi i praksis via
`defaultValue: 'live'`. Payloads genererte TypeScript-type for
`payload.create()`s `data`-parameter unntar ikke felt med
`defaultValue` fra å være påkrevd — kun `required: true` styrer det —
så hadde `source` vært `required: true` ville alle `create`-kall som
(korrekt) utelater det, feile typesjekk. Samme mønster brukes allerede
for `SlippBookings.status`.

**Access:** `read` og `create` krever en innlogget bruker
(`Boolean(req.user)`) — hvilket som helst medlem kan se historikken og
sende inn en rapport. `update` og `delete` krever i tillegg admin-rolle
(`Boolean(user?.roles?.includes('admin'))`) — vanlige medlemmer skal
ikke kunne endre eller slette noens oppføringer via API-et, kun rette
via `/admin` (jf. Ikke-mål). Loggen brukes til å avgjøre hvem som må
betale for ikke fullført dugnad, så både lesing og skriving via det
åpne Payload REST/GraphQL-API-et må være stengt for alle andre enn
innloggede medlemmer, og endring/sletting stengt for alle andre enn
admin — i motsetning til `slipp-bookings`/`clubhouse-bookings`, som
ikke har denne typen konsekvens og derfor holdes uten access-blokk.
Sidens egen `if (!user) redirect(...)`-sjekk kommer i tillegg, ikke i
stedet for, denne access-kontrollen.

**Impersonasjonsvern:** en `beforeChange`-hook tvinger `user` og
`authorName` til å samsvare med den innloggede requesteren for enhver
`create` der `req.user` finnes — uansett hva klienten faktisk sender
inn i disse feltene. Uten dette kunne et hvilket som helst innlogget
medlem (ikke bare uinnloggede utenforstående) forfalske hvem som har
sjekket kameraet, ved å sende API-kall direkte utenom appens skjema.
Importskriptet (som kjører uten en innlogget request, altså uten
`req.user`) er upåvirket av hooken og kan fortsatt sette historiske
forfatternavn fritt.

## Frontend: `/members/vaktbok`

Server-komponent, følger mønsteret fra `members/slipp/page.tsx`:
henter innlogget bruker via `payload.auth()`, redirecter til `/` hvis
ikke innlogget.

**Innhold:**

1. **Rapportskjema** (øverst, enkel og kompakt):
   - Stor tekstboks for rapporten (placeholder, f.eks. «Alt i orden»).
   - Tre knapper/pills: Morgen / Ettermiddag / Kveld. Forhåndsvalgt
     basert på klokkeslett ved sidelasting (før 11 → morgen, 11–18 →
     ettermiddag, ellers → kveld), men brukeren kan trykke på en annen
     før innsending.
   - «Lagre»-knapp. Kaller en server action (`actions.tsx`, samme
     mønster som `slipp/actions.tsx`) som oppretter en `live`-rad med
     `user: user.id`, `authorName: user.name`, valgt `period`,
     `date: new Date().toISOString()`, og skjemateksten som `content`.
   - Ved suksess: skjemaet tømmes og lista under oppdateres
     (`revalidatePath('/members/vaktbok')`).

2. **Liste over tidligere oppføringer** (under skjemaet):
   - Nyeste først. Viser dato, klokkeslett, periode (badge), forfatter
     og rapporttekst.
   - Henter siste 30 dager som standard (`payload.find` med
     `where.date.greater_than_equal` og `sort: '-date'`).
   - Enkel «vis eldre»-lenke/knapp nederst som paginerer bakover
     (`?page=` query-param) inn i full historikken (~4900 rader
     totalt etter import) — ren server-side paginering med
     `payload.find({ limit, page })`, ingen client-side
     uendelig-scroll-kompleksitet.

Ingen egne UI-komponenter utover selve siden og et lite
skjema-/liste-element trengs — holdes i tråd med eksisterende
kompleksitet i `members`-området (sammenlign `BaseMemberCard`-bruk).

## Admin-oversikt

Ingen egenutviklet side. `defaultColumns` og `defaultSort` over gir en
brukbar tabell rett i Payloads standard admin-UI på
`/admin/collections/camera-log-entries`, med gratis filtrering og
sortering på `user` og `date`. Admin krysstjekker manuelt mot den
eksterne vaktlisten ved årsslutt.

## Historikk-import

Nytt engangs-script `src/scripts/import-vaktbok.ts`, kjørt manuelt
(`npx tsx src/scripts/import-vaktbok.ts`), samme stil som
`src/scripts/seed.ts`. Leser `migration_data/vaktbok_logger.json` og
for hver post oppretter én `camera-log-entries`-rad:

- **`content`**: tittel (`title.rendered`) og strippet HTML-innhold
  (`content.rendered` med tagger fjernet og HTML-entiteter dekodet)
  slått sammen til én lesbar tekst. Nødvendig fordi 902 av 4910 poster
  har tomt `content.rendered` — for disse ligger hele rapporten i
  tittelen (f.eks. «vakt morgen», «stille rolig»).
- **`authorName`**: `_embedded.author[0].name`, med fallback til
  `` `Bruker ${author}` `` (WP-forfatter-ID) hvis embed mangler.
- **`period`**: nøkkelordsøk (case-insensitive) i `title.rendered`
  etter `morgen`, `formiddag`, `ettermiddag`, `kveld`, `natt`, `dag`.
  Normaliseres til de tre kategoriene (`formiddag`→`morgen`, `dag`→
  `ettermiddag`, `natt`→`kveld`). Ingen treff → `period` settes ikke
  (`undefined`).
- **`date`**: `date` fra WP-posten (lokal tid, ikke `date_gmt`), tolket
  som ISO-streng.
- **`source`**: `'imported'`.
- **`user`**: ikke satt.

Poster med `status !== 'publish'` hoppes over (alle 4910 har i praksis
`status: 'publish'`, men sjekken tas med for robusthet). WP-felter som
ikke trengs (`guid`, `_links`, `class_list`, `meta`, `tags`,
`categories`, `comment_status` osv.) leses ikke inn i det hele tatt.

Scriptet er idempotent nok til manuell bruk (kjøres én gang ved
lansering); det er ikke et krav at det kan kjøres flere ganger uten
duplikater, siden det er et engangsimport.

## Testing

- **Vitest**-tester for import-scriptets rene funksjoner: HTML-til-
  tekst-stripping, periode-gjetting fra tittel (inkl. normalisering og
  «ingen treff»-tilfellet).
- Manuell test i dev-server: rapportere en oppføring som innlogget
  medlem, verifisere at den dukker opp øverst i lista og i
  `/admin/collections/camera-log-entries`; verifisere paginering
  bakover i historikken; verifisere redirect for ikke-innloggede
  brukere.

## Fremtidig arbeid (eksplisitt utenfor scope nå)

- Digital vaktliste/turnusfordeling (hvem *skal* ha vakt når), som
  ville gjort det mulig å automatisk flagge manglende sjekker i
  admin-visningen i stedet for manuell sammenligning.
