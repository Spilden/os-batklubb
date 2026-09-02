## Admin Login
1. Email - post@progmatic.no
2. passord - progmatic

## Seede database
``` npm run seed ```

## Databasemigrasjoner
Skjemaendringer skjer nå via migrasjoner (`src/migrations/`) i stedet for automatisk `push` mot databasen. Det fjerner faren for at `npm run dev` plutselig spør om å slette tabeller når du bytter branch.

- Etter å ha endret en collection/global: `npm run migrate:create <navn>`, commit den genererte filen.
- På en ny database (fersk klone, ny branch med egen db-fil): `npm run migrate` for å opprette skjemaet.
- Sjekk status: `npm run migrate:status`

**Har du en eksisterende lokal `db/*.db` fra før migrasjoner ble innført?** Den trenger ingen handling — skjemaet er allerede der (laget med `push`), og appen leser den som normalt. Du trenger først `npm run migrate` når en *ny* migrasjon legges til senere. Kjøres `npm run migrate` likevel, oppdager Payload at databasen kommer fra `push` og spør om det er greit å fortsette — svar **nei** for å la skjemaet stå urørt.

## Kilder - Dokumentasjon
- [Payload docs](https://payloadcms.com/docs/)
- [Resend docs](https://resend.com/docs/)
- [Met.no docs](https://api.met.no/weatherapi/locationforecast/2.0/documentation)