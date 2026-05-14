'use client'
import { useRef } from 'react'

type Props = {
  onCloseAction: () => void
  children: React.ReactNode
}

export function BaseModal({ onCloseAction, children }: Props) {
  const downOnOverlay = useRef(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onMouseDown={(e) => {
        downOnOverlay.current = e.target === e.currentTarget
      }}
      onMouseUp={() => {
        if (downOnOverlay.current) onCloseAction()
      }}
    >
      <div
        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
