'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { BaseMemberCard } from '@/components/BaseMemberCard'
import {
  filterMembers,
  sortMembers,
  type MemberSortKey,
  type RoleFilter,
  type SearchableMember,
  type SortDirection,
} from '@/lib/admin/memberSearch'
import { inputClass } from './styles'

export type MemberRow = SearchableMember & {
  roles: string[]
  roleKeys: string[]
  since: string | null
  sinceLabel: string
}

// Fixed column shares: no column can grow and push the others aside.
const COLUMNS = 'md:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,3fr)_7rem]'

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'admin', label: 'Admin' },
  { value: 'news_admin', label: 'Nyhetsredaktør' },
  { value: 'kameravakt', label: 'Kameravakt' },
]

const SORT_OPTIONS: { key: MemberSortKey; label: string; firstDirection: SortDirection }[] = [
  { key: 'name', label: 'Navn', firstDirection: 'asc' },
  { key: 'email', label: 'E-post', firstDirection: 'asc' },
  { key: 'since', label: 'Medlem siden', firstDirection: 'desc' },
]

export function MemberSearchList({ members }: { members: MemberRow[] }) {
  const [query, setQuery] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [role, setRole] = useState<RoleFilter>('all')
  const [sortKey, setSortKey] = useState<MemberSortKey>('name')
  const [direction, setDirection] = useState<SortDirection>('asc')
  const shown = useMemo(
    () => sortMembers(filterMembers(members, query, includeInactive, role), sortKey, direction),
    [members, query, includeInactive, role, sortKey, direction],
  )

  function chooseSort(option: (typeof SORT_OPTIONS)[number]) {
    if (option.key === sortKey) {
      setDirection(direction === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(option.key)
      setDirection(option.firstDirection)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk på navn eller e-post"
          autoFocus
          className={`${inputClass} flex-1 min-w-48`}
        />
        <label className="flex items-center gap-2 text-text text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Vis deaktiverte
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Vis rolle">
        <span className="text-text-muted">Vis:</span>
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setRole(f.value)}
            aria-pressed={role === f.value}
            className={`border border-ocean rounded-full px-3 py-1 cursor-pointer transition-colors ${
              role === f.value ? 'bg-ocean text-surface' : 'text-text hover:bg-ocean/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <BaseMemberCard title={`${shown.length} medlemmer`}>
        {shown.length === 0 ? (
          <p className="text-text-muted text-center p-10">Ingen medlemmer funnet.</p>
        ) : (
          <div className="flex flex-col">
            <div
              className={`flex flex-wrap gap-x-4 gap-y-1 md:grid ${COLUMNS} md:gap-4 pb-2 border-b border-border text-xs uppercase text-text-muted`}
            >
              {SORT_OPTIONS.map((option) => {
                const active = option.key === sortKey
                const header = (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => chooseSort(option)}
                    aria-pressed={active}
                    title={`Sorter etter ${option.label.toLowerCase()}`}
                    className={`text-left uppercase cursor-pointer hover:text-text ${active ? 'text-text font-semibold' : ''}`}
                  >
                    {option.label}
                    <span aria-hidden className={active ? '' : 'opacity-30'}>
                      {' '}
                      {active ? (direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                    {active && (
                      <span className="sr-only">
                        {direction === 'asc' ? ' (stigende)' : ' (synkende)'}
                      </span>
                    )}
                  </button>
                )
                return option.key === 'since'
                  ? [<span key="roles" className="hidden md:block">Roller</span>, header]
                  : header
              })}
            </div>
            <ul className="flex flex-col">
              {shown.map((m) => (
                <li key={m.id} className="border-b border-border/50">
                  <Link
                    href={`/members/admin/medlemmer/${m.id}`}
                    className={`grid grid-cols-1 ${COLUMNS} gap-1 md:gap-4 md:items-center py-3 hover:bg-background/60 rounded`}
                  >
                    <span className="min-w-0 text-text font-medium break-words">
                      {m.name}
                      {!m.active && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 whitespace-nowrap">
                          Deaktivert
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 text-text-muted text-sm truncate" title={m.email}>
                      {m.email}
                    </span>
                    <span className="min-w-0 flex flex-wrap gap-1">
                      {m.roles.map((role) => (
                        <span
                          key={role}
                          className="text-xs px-2 py-0.5 rounded-full bg-sand/30 text-text-muted border border-border whitespace-nowrap"
                        >
                          {role}
                        </span>
                      ))}
                    </span>
                    <span className="text-text-muted text-sm whitespace-nowrap">
                      <span className="md:hidden">Medlem siden </span>
                      {m.sinceLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BaseMemberCard>
    </div>
  )
}
