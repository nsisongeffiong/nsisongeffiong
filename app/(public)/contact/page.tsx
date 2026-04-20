import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      <SiteNav />

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 700, letterSpacing: '-0.03em',
          lineHeight: 1, marginBottom: '1.5rem', color: 'var(--txt)',
        }}>
          Contact
        </h1>

        <p style={{
          fontFamily: 'var(--font-source-serif), serif',
          fontSize: '18px', lineHeight: 1.7, color: 'var(--txt2)',
          fontWeight: 300, marginBottom: '2rem',
        }}>
          Email is the best way to reach me. I read everything and try to reply to anything worth replying to.
        </p>

        <a
          href="mailto:hello@nsisongeffiong.com"
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '14px', color: 'var(--txt)', letterSpacing: '0.04em',
          }}
        >
          nsisongeffiong@gmail.com
        </a>
      </main>

      <SiteFooter />
    </div>
  )
}
