'use client'

import Link from 'next/link'

function formatDate(d: Date | null | undefined): string {
  if (!d) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type PostSnippet = { id: string | number; title: string; slug: string; publishedAt: Date | null } | undefined

interface Props {
  poetry: PostSnippet
  tech: PostSnippet
  ideas: PostSnippet
}

export function HomeSectionCards({ poetry, tech, ideas }: Props) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      borderTop: '0.5px solid var(--bdr)',
    }}>

      {/* Poetry */}
      <Link href="/poetry" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div className="hover-bg" style={{
          padding: '2.5rem 2rem 2rem', borderRight: '0.5px solid var(--bdr)',
          position: 'relative', minHeight: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--purple)', marginBottom: '2.5rem' }}>
              01 · Poetry
            </div>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '32px', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.1, marginBottom: '0.75rem', color: 'var(--txt)' }}>
              The literary space
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--txt2)', lineHeight: 1.65, marginBottom: 'auto', paddingBottom: '2rem' }}>
              Verse, imagery, and language pressed into new shapes. Poetry as a way of knowing.
            </p>
            <div style={{ borderTop: '0.5px solid var(--bdr)', paddingTop: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: '0.5rem' }}>Latest</p>
              {poetry ? (
                <>
                  <Link
                    href={`/poetry/${poetry.slug}`}
                    className="post-title-link"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: '15px', display: 'block' }}
                  >
                    &ldquo;{poetry.title}&rdquo;
                  </Link>
                  <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--txt3)', marginTop: '0.35rem' }}>
                    {formatDate(poetry.publishedAt)}
                  </p>
                </>
              ) : (
                <p style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: '15px', color: 'var(--txt)' }}>—</p>
              )}
            </div>
            <span style={{ position: 'absolute', top: '2.5rem', right: '2rem', fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </div>
      </Link>

      {/* Tech */}
      <Link href="/tech" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div className="hover-bg" style={{
          padding: '2.5rem 2rem 2rem', borderRight: '0.5px solid var(--bdr)',
          position: 'relative', minHeight: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--teal-mid)', marginBottom: '2.5rem' }}>
              02 · Tech
            </div>
            <h2 style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '20px', fontWeight: 500, lineHeight: 1.1, marginBottom: '0.75rem', color: 'var(--txt)' }}>
              ./engineering
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--txt2)', lineHeight: 1.65, marginBottom: 'auto', paddingBottom: '2rem' }}>
              Deep dives on AI systems, software architecture, and building with emerging tools.
            </p>
            <div style={{ borderTop: '0.5px solid var(--bdr)', paddingTop: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: '0.5rem' }}>Latest</p>
              {tech ? (
                <>
                  <Link
                    href={`/tech/${tech.slug}`}
                    className="post-title-link"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', display: 'block' }}
                  >
                    {tech.title}
                  </Link>
                  <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--txt3)', marginTop: '0.35rem' }}>
                    {formatDate(tech.publishedAt)}
                  </p>
                </>
              ) : (
                <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', color: 'var(--txt)' }}>—</p>
              )}
            </div>
            <span style={{ position: 'absolute', top: '2.5rem', right: '2rem', fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </div>
      </Link>

      {/* Ideas */}
      <Link href="/ideas" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div className="hover-bg" style={{
          padding: '2.5rem 2rem 2rem',
          position: 'relative', minHeight: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--amber)', marginBottom: '2.5rem' }}>
              03 · Ideas
            </div>
            <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.75rem', color: 'var(--txt)' }}>
              Essays &amp; Policy
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--txt2)', lineHeight: 1.65, marginBottom: 'auto', paddingBottom: '2rem' }}>
              Writing on governance, technology in society, and ideas that deserve more friction.
            </p>
            <div style={{ borderTop: '0.5px solid var(--bdr)', paddingTop: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: '0.5rem' }}>Latest</p>
              {ideas ? (
                <>
                  <Link
                    href={`/ideas/${ideas.slug}`}
                    className="post-title-link"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '14px', display: 'block' }}
                  >
                    {ideas.title}
                  </Link>
                  <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--txt3)', marginTop: '0.35rem' }}>
                    {formatDate(ideas.publishedAt)}
                  </p>
                </>
              ) : (
                <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '14px', color: 'var(--txt)' }}>—</p>
              )}
            </div>
            <span style={{ position: 'absolute', top: '2.5rem', right: '2rem', fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </div>
      </Link>

    </div>
  )
}
