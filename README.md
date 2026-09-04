# Os Båtklubb

En webapplikasjon for Os Båtklubb, bygget av Stevan Mitrikeski Vågen og Martin Spilde Austgulen.

## Kom i gang

For å kjøre dette prosjektet må du ha følgende forutsetninger:

- **Node.js**: `^18.20.2` eller `^20.9.0`
- **Pakkebehandler**: `npm`
- .env fil med riktig innhold

```bash
# 1. Installer alle pakker
npm install

# 2. Seed data testdata til databasen
npm run seed

# 3. Start utviklingsserveren
npm run dev

# 4. Åpner nettleser på denne adressen
http://localhost:3000
```


### Admin tilgang

For testing av payload admin panel så har vi lagt til en test bruker i seed
**URL**: `/admin`  
**E-post**: `admin@progmatic.no`  
**Passord**: `progmatic`

## Databasemigrasjoner
Skjemaendringer skjer nå via migrasjoner (`src/migrations/`) i stedet for automatisk `push` mot databasen. Det fjerner faren for at `npm run dev` plutselig spør om å slette tabeller når du bytter branch.

- Etter å ha endret en collection/global: `npm run migrate:create <navn>`, commit den genererte filen.
- På en ny database (fersk klone, ny branch med egen db-fil): `npm run migrate` for å opprette skjemaet.
- Sjekk status: `npm run migrate:status`

**Har du en eksisterende lokal `db/*.db` fra før migrasjoner ble innført?** Den trenger ingen handling — skjemaet er allerede der (laget med `push`), og appen leser den som normalt. Du trenger først `npm run migrate` når en *ny* migrasjon legges til senere. Kjøres `npm run migrate` likevel, oppdager Payload at databasen kommer fra `push` og spør om det er greit å fortsette — svar **nei** for å la skjemaet stå urørt.

## Kilder - Dokumentasjon
- [Next.js docs](https://nextjs.org/docs)
- [Payload docs](https://payloadcms.com/docs/)
- [Resend docs](https://resend.com/docs/)
- [Met.no docs](https://api.met.no/weatherapi/locationforecast/2.0/documentation)
- [FullCalendar docs](https://fullcalendar.io/docs)
- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [MDN](https://developer.mozilla.org/en-US/)
- [Weather Underground docs](https://docs.google.com/document/d/1KGb8bTVYRsNgljnNH67AMhckY8AQT2FVwZ9urj8SWBs/edit?tab=t.0)
- [Kartverket docs](https://vannstand.kartverket.no/tideapi_no.html)


## Utvikling

### Teknologier

- **Framework**: Next.js 16
- **React**: React 19
- **Språk**: TypeScript 5.7
- **CMS**: Payload CMS 3.79
- **Database**: SQLite
- **Styling**: Tailwind CSS 4
- **Email**: Resend
- **Kalender**: FullCalendar 6


### Prosjektstruktur
- `src/collections/` - Konfigurasjon for databaserelasjoner
- `src/globals/` - Globale innstillinger
- `src/app/` - Next.js App Router, delt i to route groups:
  - `(frontend)/` - Brukervendte sider
  - `(payload)/` - Payload CMS admin-panel og API-ruter
- `src/components/` - Frontend-komponenter
  - `modals/` - Frontend-modaler
- `src/lib/` - Auth og serverside hjelpefunksjoner
- `src/utils/` - Nyttefunksjoner
- `public/` - Statiske filer
  - `images/` - Bildefiler

### Vanlige kommandoer

| Kommando                     | Beskrivelse                                  |
|------------------------------|----------------------------------------------|
| `npm install`                | Laster ned alle avhengiheter                 |
| `npm run dev`                | Starter utviklingsserveren                   |
| `npm run build`              | Bygger prosjektet for produksjon             |
| `npm run start`              | Starter produksjonsversjonen                 |
| `npm run generate:types`     | Regenererer Payload TypeScript-typer         |