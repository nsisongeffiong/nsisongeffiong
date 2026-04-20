import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'

export default function LegalPage() {
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
          Legal
        </h1>

        {[
          {
            heading: 'Copyright',
            body: 'All writing, poetry, and original content on this site is copyright © Nsisong Effiong. All rights reserved.',
          },
          {
            heading: 'Reproduction',
            body: 'No content may be reproduced, republished, or redistributed in any form without prior written permission. Brief quotation for review or commentary is permitted with attribution.',
          },
          {
            heading: 'Disclaimer',
            body: 'This site is provided as-is, without warranty of any kind. The views expressed are the author\'s own and do not represent any employer or organisation.',
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
