'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="2"  x2="12" y2="4"  />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"   />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2"  y1="12" x2="4"  y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"  />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8"  y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

type KnownTheme = 'light' | 'dark' | 'system'

const CYCLE: Array<{ value: KnownTheme; Icon: () => JSX.Element; title: string }> = [
  { value: 'light',  Icon: SunIcon,     title: 'Switch to dark mode'   },
  { value: 'dark',   Icon: MoonIcon,    title: 'Switch to system mode' },
  { value: 'system', Icon: MonitorIcon, title: 'Switch to light mode'  },
]

function isKnown(v: string | undefined): v is KnownTheme {
  return v === 'light' || v === 'dark' || v === 'system'
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // Stable display value — only updated when theme is a known string
  const [display, setDisplay] = useState<KnownTheme>('system')
  const [disabled, setDisabled] = useState(false)
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && isKnown(theme)) {
      setDisplay(theme)
    }
  }, [mounted, theme])

  if (!mounted) return <div style={{ width: 30, height: 28 }} />

  const idx = CYCLE.findIndex(c => c.value === display)
  const safeIdx = idx === -1 ? 2 : idx
  const { Icon, title } = CYCLE[safeIdx]
  const next = CYCLE[(safeIdx + 1) % CYCLE.length].value

  function handleClick() {
    if (disabled) return
    setTheme(next)
    setDisabled(true)
    cooldownRef.current = setTimeout(() => setDisabled(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          30,
        height:         28,
        background:     'var(--bg3)',
        color:          'var(--txt)',
        border:         '0.5px solid var(--bdr2)',
        borderRadius:   '3px',
        cursor:         disabled ? 'default' : 'pointer',
        transition:     'background 0.15s, color 0.15s',
      }}
    >
      <Icon />
    </button>
  )
}
