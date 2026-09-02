'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import BaseButton from '@/components/BaseButton'
import { VaktbokInstructionsModal } from '@/components/modals/VaktbokInstructionsModal'

export function VaktbokInstructionsButton() {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <>
      <BaseButton
        type="button"
        variant="secondary"
        className="!px-3 !py-1.5 !text-xs flex items-center gap-1.5 not-italic"
        onClick={() => setShowInstructions(true)}
      >
        <Info size={16} />
        Instruksjoner
      </BaseButton>

      {showInstructions && (
        <VaktbokInstructionsModal onCloseAction={() => setShowInstructions(false)} />
      )}
    </>
  )
}
