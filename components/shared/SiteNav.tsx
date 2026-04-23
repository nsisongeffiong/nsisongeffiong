'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { NAV_LINKS } from '@/types'

// Section indicators — shown in the nav right for context
const SECTION_LABELS: Record<string, { label: string; color: string }> = {
  '/poetry': { label: '01 / Poetry', color: 'var(--purple)'   },
  '/tech':   { label: '02 / Tech',   color: 'var(--teal-mid)' },
  '/ideas':  { label: '03 / Ideas',  color: 'var(--amber)'    },
  '/about':  { label: 'About',       color: 'var(--txt2)'     },
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
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav
        style={{
          position:        'sticky',
          top:             0,
          zIndex:          10,
          display:         'flex',
          justifyContent:  'space-between',
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
          }}
        >
          Nsisong Effiong
        </Link>

        {/* Nav links — center (hidden on mobile) */}
        <div className="nav-desktop" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', alignItems: 'center', gap: '1.75rem' }}>
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

        {/* Right — section label + theme toggle + hamburger */}
        <div
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '1rem',
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

          {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      'var(--txt)',
              padding:    '4px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <line x1="3" y1="6"  x2="19" y2="6"  />
              <line x1="3" y1="11" x2="19" y2="11" />
              <line x1="3" y1="16" x2="19" y2="16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div
          style={{
            position:       'fixed',
            inset:          0,
            background:     'var(--bg)',
            zIndex:         100,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '2rem',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              position:   'absolute',
              top:        '1.25rem',
              right:      '2rem',
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      'var(--txt)',
              padding:    '4px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <line x1="4" y1="4" x2="18" y2="18" />
              <line x1="18" y1="4" x2="4" y2="18" />
            </svg>
          </button>

          {/* Main nav links */}
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily:     'var(--font-cormorant), serif',
                  fontSize:       '48px',
                  fontStyle:      'italic',
                  fontWeight:     400,
                  color:          isActive ? 'var(--txt)' : 'var(--txt2)',
                  textDecoration: 'none',
                  letterSpacing:  '-0.01em',
                }}
              >
                {link.label}
              </Link>
            )
          })}

          {/* Section crumb if present */}
          {section && (
            <span
              style={{
                fontFamily:    'var(--font-dm-mono), monospace',
                fontSize:      '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color:         section.color,
                marginTop:     '0.5rem',
              }}
            >
              {section.label}
            </span>
          )}
        </div>
      )}
    </>
  )
}
