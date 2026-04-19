'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { NAV_LINKS } from '@/types'

// Section indicators — shown in the nav right for context
const SECTION_LABELS: Record<string, { label: string; color: string }> = {
  '/poetry': { label: '01 / Poetry', color: 'var(--purple)'   },
  '/tech':   { label: '02 / Tech',   color: 'var(--teal-mid)' },
  '/ideas':  { label: '03 / Ideas',  color: 'var(--amber)'    },
}

function getSectionLabel(pathname: string) {
  for (const [prefix, val] of Object.entries(SECTION_LABELS)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return val
  }
  return null
}

export function SiteNav() {
  const pathname = usePathname()
  const section  = getSectionLabel(pathname)

  return (
    <nav
      style={{
        position:        'sticky',
        top:             0,
        zIndex:          10,
        display:         'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems:      'center',
        padding:         '1.25rem 2rem',
        borderBottom:    '0.5px solid var(--bdr)',
        background:      'color-mix(in oklab, var(--bg) 92%, transparent)',
        backdropFilter:  'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Logo — left */}
      <Link
        href="/"
        style={{
          fontFamily:     'var(--font-cormorant), serif',
          fontSize:       '18px',
          fontStyle:      'italic',
          fontWeight:     400,
          letterSpacing:  '-0.01em',
          color:          'var(--txt)',
          textDecoration: 'none',
          justifySelf:    'start',
        }}
      >
        Nsisong Effiong
      </Link>

      {/* Nav links — center */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily:     'var(--font-syne), sans-serif',
                fontSize:       '12px',
                letterSpacing:  '0.04em',
                color:          isActive ? 'var(--txt)' : 'var(--txt2)',
                textDecoration: isActive ? 'underline' : 'none',
                textUnderlineOffset: '6px',
                textDecorationThickness: '1px',
                fontWeight:     isActive ? 500 : 400,
                transition:     'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Right — section label + theme toggle */}
      <div
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         '1rem',
          justifySelf: 'end',
        }}
      >
        {section && (
          <span
            style={{
              fontFamily:    'var(--font-dm-mono), monospace',
              fontSize:      '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:         section.color,
            }}
          >
            {section.label}
          </span>
        )}
        <ThemeToggle />
      </div>
    </nav>
  )
}
