'use client'

import { joinDateTime, splitDateTime, timeOptions } from '@/lib/admin/eventTimes'
import { inputClass, labelClass } from './styles'

type Props = {
  id: string
  label: string
  /** "YYYY-MM-DDTHH:MM" in local time, or '' */
  value: string
  onChange: (value: string) => void
  /** Time used when a date is picked before a time. */
  defaultTime?: string
  minDate?: string
}

/**
 * Date + 24-hour time. Native datetime-local follows the browser language and can show
 * AM/PM, so the time is a plain list of quarter hours instead.
 */
export function DateTimeField({ id, label, value, onChange, defaultTime = '18:00', minDate }: Props) {
  const { date, time } = splitDateTime(value)

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className={`${labelClass} pb-1`}>{label}</legend>
      <div className="flex gap-2">
        <input
          id={`${id}-date`}
          type="date"
          aria-label={`${label}, dato`}
          required
          min={minDate}
          value={date}
          onChange={(e) => onChange(joinDateTime(e.target.value, time || defaultTime))}
          className={`${inputClass} flex-1 min-w-0`}
        />
        <select
          id={`${id}-time`}
          aria-label={`${label}, klokkeslett`}
          required
          value={time}
          onChange={(e) => onChange(joinDateTime(date, e.target.value))}
          disabled={!date}
          className={`${inputClass} w-28 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {!time && <option value="">--:--</option>}
          {timeOptions(time).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  )
}
