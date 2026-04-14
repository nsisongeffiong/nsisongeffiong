'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { NAV_LINKS } from '@/types'

export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '1.25rem 2rem',
        borderBottom:   '0.5px solid var(--bdr)',
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily:  'var(--font-cormorant), serif',
          fontSize:    '18px',
          fontStyle:   'italic',
          color:       'var(--txt)',
          textDecoration: 'none',
        }}
      >
        Nsisong Effiong
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize:       '11px',
              letterSpacing:  '0.08em',
              textTransform:  'uppercase',
              color:          pathname.startsWith(link.href)
                                ? 'var(--txt)'
                                : 'var(--txt2)',
              textDecoration: 'none',
              fontWeight:     pathname.startsWith(link.href) ? 500 : 400,
            }}
          >
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
      </div>
    </nav>
  )
}
