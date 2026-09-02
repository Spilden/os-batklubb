import { BaseModal } from '@/components/modals/BaseModal'

export function VaktbokInstructionsModal({ onCloseAction }: { onCloseAction: () => void }) {
  return (
    <BaseModal onCloseAction={onCloseAction}>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-semibold text-text">Slik fungerer kameravakten</h2>
        <button
          onClick={onCloseAction}
          className="ml-4 p-1.5 rounded-lg hover:bg-border/30 text-text-muted transition-colors cursor-pointer"
          aria-label="Lukk"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm text-text-muted leading-relaxed">
        <p>
          Når du har kameravakt skal du{' '}
          <span className="font-semibold text-text">
            sjekke alle kameraene og skrive en rapport 3 ganger i løpet av døgnet
          </span>{' '}
          — for eksempel morgen, ettermiddag og kveld. Det er ikke bundet til faste klokkeslett,
          bare fordelt utover dagen.
        </p>

        <p>
          Skriv rapport hver gang du har gått gjennom kameraene, og trykk{' '}
          <span className="font-semibold text-text">Lagre</span>. Rapportene gjør det enkelt å
          dokumentere at kameravakten er gjennomført som den skal.{' '}
          <span className="font-medium text-text">&quot;Alt i orden&quot;</span> er en fullgod
          rapport hvis det ikke er noe å bemerke.
        </p>

        <p>
          Du kan se hva som er rapportert tidligere lenger ned på siden, og rette dine egne
          rapporter i etterkant om du oppdager en feil.
        </p>
      </div>
    </BaseModal>
  )
}
