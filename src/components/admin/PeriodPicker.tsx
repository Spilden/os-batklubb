import BaseButton from '@/components/BaseButton'
import type { Period } from '@/lib/admin/vaktbokPeriod'
import { inputClass, labelClass } from './styles'

type Props = { period: Period; basePath: string }

/** Server-rendered period picker: preset links plus a plain GET form (works without JS). */
export function PeriodPicker({ period, basePath }: Props) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex flex-wrap justify-center gap-2 text-sm" aria-label="Hurtigvalg for periode">
        {period.presets.map((preset) => {
          const active = preset.fra === period.fra && preset.til === period.til
          return (
            <a
              key={preset.label}
              href={`${basePath}?fra=${preset.fra}&til=${preset.til}`}
              aria-current={active ? 'true' : undefined}
              className={`border border-ocean rounded-full px-3 py-1 transition-colors ${
                active ? 'bg-ocean text-surface' : 'text-text hover:bg-ocean/10'
              }`}
            >
              {preset.label}
            </a>
          )
        })}
      </div>

      <form action={basePath} className="flex flex-wrap items-end justify-center gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fra" className={labelClass}>
            Fra
          </label>
          <input id="fra" name="fra" type="date" defaultValue={period.fra} required title="Skriv inn en dato, eller trykk på kalenderen for å velge" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="til" className={labelClass}>
            Til
          </label>
          <input id="til" name="til" type="date" defaultValue={period.til} required title="Skriv inn en dato, eller trykk på kalenderen for å velge" className={inputClass} />
        </div>
        <BaseButton type="submit" variant="secondary">
          Vis periode
        </BaseButton>
      </form>
    </div>
  )
}
