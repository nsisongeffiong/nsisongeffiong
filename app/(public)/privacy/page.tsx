import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      <SiteNav />

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 700, letterSpacing: '-0.03em',
          lineHeight: 1, marginBottom: '2.5rem', color: 'var(--txt)',
        }}>
          Privacy Policy
        </h1>

        {[
          {
            heading: 'What data is collected',
            body: 'If you leave a comment, the comment form collects your name and email address. No other personal data is collected.',
          },
          {
            heading: 'How it is used',
            body: 'Your name and email are used solely for comment moderation. They are never sold, shared with third parties, or used for marketing.',
          },
          {
            heading: 'Cookies',
            body: 'This site sets one cookie to remember your theme preference (light or dark). No tracking or advertising cookies are used.',
          },
          {
            heading: 'Data requests',
            body: 'To request access to, correction of, or deletion of any personal data held about you, email hello@nsisongeffiong.com.',
          },
        ].map(({ heading, body }) => (
          <section key={heading} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '18px', fontWeight: 600, letterSpacing: '-0.015em',
              marginBottom: '0.75rem', color: 'var(--txt)',
            }}>
              {heading}
            </h2>
            <p style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontSize: '16px', lineHeight: 1.75, color: 'var(--txt2)', fontWeight: 300,
            }}>
              {body}
            </p>
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  )
}
