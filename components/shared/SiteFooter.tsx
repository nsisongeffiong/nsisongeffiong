import React from 'react'
export function SiteFooter({ section }: { section?: string }) {
  const year = new Date().getFullYear()
  const monoStyle: React.CSSProperties = {
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '11px',
    color: 'var(--txt3)',
  }
  const navLinks = (
    <>
      <a href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
      {' · '}
      <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
      {' · '}
      <a href="/legal" style={{ color: 'inherit', textDecoration: 'none' }}>Legal</a>
    </>
  )
  if (!section) {
    return (
      <footer style={{ borderTop: '0.5px solid var(--bdr)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={monoStyle}>© Nsisong Effiong 2011–{year}</span>
        <span title="Chenned, Deadhouse Gates — Steven Erikson" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: '14px', color: 'var(--txt2)', textAlign: 'center', cursor: 'default' }}>
          &ldquo;Save me a patch of grass when you go down&rdquo;
        </span>
        <span style={monoStyle}>{navLinks}</span>
      </footer>
    )
  }
  return (
    <footer style={{ borderTop: '0.5px solid var(--bdr)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={monoStyle}>{section}</span>
      <span style={monoStyle}>© Nsisong Effiong 2011–{year} · {navLinks}</span>
    </footer>
  )
}
