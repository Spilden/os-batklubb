'use client'
import { useField } from '@payloadcms/ui'

export function ColorPickerField({ path }: { path: string }) {
  const { value, setValue } = useField<string>({ path })

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Farge</label>
      <input
        type="color"
        value={value ?? '#378ADD'}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: 48, height: 36, cursor: 'pointer', border: 'none', padding: 0 }}
      />
    </div>
  )
}
