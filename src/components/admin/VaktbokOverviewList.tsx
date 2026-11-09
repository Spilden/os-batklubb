'use client'

import { useMemo, useState } from 'react'
import {
  sortOverviewRows,
  type OverviewSortDirection,
  type OverviewSortKey,
} from '@/lib/admin/vaktbokSort'

export type VaktbokRow = {
  key: string
  name: string
  count: number
  last: string | null
  lastLabel: string | null
  entries: Array<{ label: string; content: string }>
}

const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_7.5rem_7.5rem] sm:grid-cols-[minmax(0,1fr)_9rem_9rem] gap-x-6 sm:gap-x-10 items-center'

const SORT_OPTIONS: { key: OverviewSortKey; label: string; firstDirection: OverviewSortDirection; align: string }[] = [
  { key: 'name', label: 'Navn', firstDirection: 'asc', align: 'text-left' },
  { key: 'count', label: 'Rapporter', firstDirection: 'asc', align: 'text-right' },
  { key: 'last', label: 'Sist rapport', firstDirection: 'desc', align: 'text-right' },
]

export function VaktbokOverviewList({ rows }: { rows: VaktbokRow[] }) {
  const [sortKey, setSortKey] = useState<OverviewSortKey>('count')
  const [direction, setDirection] = useState<OverviewSortDirection>('asc')
  const shown = useMemo(() => sortOverviewRows(rows, sortKey, direction), [rows, sortKey, direction])

  function chooseSort(option: (typeof SORT_OPTIONS)[number]) {
    if (option.key === sortKey) {
      setDirection(direction === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(option.key)
      setDirection(option.firstDirection)
    }
  }

  return (
    <div className="flex flex-col">
      <div className={`${COLUMNS} pb-2 border-b border-border text-xs uppercase text-text-muted`}>
        {SORT_OPTIONS.map((option) => {
          const active = option.key === sortKey
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => chooseSort(option)}
              aria-pressed={active}
              title={`Sorter etter ${option.label.toLowerCase()}`}
              className={`${option.align} uppercase cursor-pointer hover:text-text whitespace-nowrap ${active ? 'text-text font-semibold' : ''}`}
            >
              {option.label}
              <span aria-hidden className={active ? '' : 'opacity-30'}>
                {' '}
                {active ? (direction === 'asc' ? '▲' : '▼') : '↕'}
              </span>
              {active && (
                <span className="sr-only">{direction === 'asc' ? ' (stigende)' : ' (synkende)'}</span>
              )}
            </button>
          )
        })}
      </div>

      {shown.map((row) =>
        row.count === 0 ? (
          <div key={row.key} className={`${COLUMNS} border-b border-border/50 py-2`}>
            <span className="text-text min-w-0 break-words">{row.name}</span>
            <span className="text-red-600 font-medium text-right whitespace-nowrap">Ingen rapporter</span>
            <span className="text-text-muted text-right">—</span>
          </div>
        ) : (
          <details key={row.key} className="group border-b border-border/50 py-2">
            <summary className={`${COLUMNS} cursor-pointer text-text list-none [&::-webkit-details-marker]:hidden`}>
              <span className="min-w-0 break-words">
                <span aria-hidden className="inline-block text-text-muted mr-1 transition-transform group-open:rotate-90">▸</span>
                {row.name}
              </span>
              <span className="text-right whitespace-nowrap">{row.count}</span>
              <span className="text-text-muted text-right whitespace-nowrap">{row.lastLabel}</span>
            </summary>
            <ul className="pt-2 pl-4 text-sm flex flex-col gap-2">
              {row.entries.map((entry, i) => (
                <li key={i} className="flex gap-2 min-w-0">
                  <span className="text-text-muted whitespace-nowrap">{entry.label}</span>
                  <span className="text-text-muted">—</span>
                  <span className="text-text truncate">{entry.content}</span>
                </li>
              ))}
            </ul>
          </details>
        ),
      )}
    </div>
  )
}
