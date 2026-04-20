import React from 'react'

const navLinks = (
  <>
    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
    {' · '}
    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
    {' · '}
    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Legal</a>
  </>
)

export function SiteFooter({ section }: { section?: string }) {
  const year = new Date().getFullYear()
  const monoStyle: React.CSSProperties = {
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '11px',
    color: 'var(--txt3)',
  }

  if (!section) {
    return (
      <footer style={{
        borderTop: '0.5px solid var(--bdr)',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={monoStyle}>© Nsisong Effiong {year}</span>

        <span
          title="Chenned, Deadhouse Gates — Steven Erikson"
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontStyle: 'italic',
            fontSize: '14px',
            color: 'var(--txt2)',
            textAlign: 'center',
            cursor: 'default',
          }}
        >
          Save me a patch of grass when you go down
        </span>

        <span style={monoStyle}>{navLinks}</span>
      </footer>
    )
  }

  return (
    <footer style={{
      borderTop: '0.5px solid var(--bdr)',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--txt3)' }}>
        {section}
      </span>

      <span style={monoStyle}>
        © Nsisong Effiong {year} · {navLinks}
      </span>
    </footer>
  )
}
