// Shared site footer — appears on all public pages
export function SiteFooter({ section }: { section?: string }) {
  return (
    <footer
      style={{
        borderTop:      '0.5px solid var(--bdr)',
        padding:        '1.5rem 2rem',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        fontSize:       '12px',
        color:          'var(--txt3)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
        {section ?? 'nsisongeffiong.com'}
      </span>

      <span
        style={{
          fontFamily:   'var(--font-cormorant), serif',
          fontStyle:    'italic',
          fontSize:     '14px',
          color:        'var(--txt2)',
          textAlign:    'center',
        }}
      >
        &ldquo;Save me a patch of grass when you go down&rdquo;
      </span>

      <span style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
        © {new Date().getFullYear()}
      </span>
    </footer>
  )
}
