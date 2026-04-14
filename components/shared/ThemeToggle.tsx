'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const LABELS: Record<string, string> = {
  system: 'Auto',
  light:  'Light',
  dark:   'Dark',
}

const NEXT_THEME: Record<string, string> = {
  system: 'light',
  light:  'dark',
  dark:   'system',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const current = theme ?? 'system'

  return (
    <button
      onClick={() => setTheme(NEXT_THEME[current] ?? 'system')}
      title={`Theme: ${LABELS[current]} — click to change`}
      style={{
        fontFamily:     'var(--font-dm-mono), monospace',
        fontSize:       '10px',
        letterSpacing:  '0.1em',
        textTransform:  'uppercase',
        color:          'var(--txt3)',
        background:     'none',
        border:         '0.5px solid var(--bdr2)',
        borderRadius:   '3px',
        padding:        '4px 10px',
        cursor:         'pointer',
        transition:     'color 0.15s, border-color 0.15s',
      }}
    >
      {LABELS[current]}
    </button>
  )
}
