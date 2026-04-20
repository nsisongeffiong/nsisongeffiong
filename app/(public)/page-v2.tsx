export const dynamic = 'force-dynamic'

import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import Link from 'next/link'

function formatDate(d: Date | null | undefined): string {
  if (!d) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function HomePageV2() {
  const [latestPoetry, latestTech, latestIdeas] = await Promise.all([
    db.select({ id: posts.id, title: posts.title, slug: posts.slug, publishedAt: posts.publishedAt })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'poetry')))
      .orderBy(desc(posts.publishedAt)).limit(1),
    db.select({ id: posts.id, title: posts.title, slug: posts.slug, publishedAt: posts.publishedAt })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'tech')))
      .orderBy(desc(posts.publishedAt)).limit(1),
    db.select({ id: posts.id, title: posts.title, slug: posts.slug, publishedAt: posts.publishedAt })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'ideas')))
      .orderBy(desc(posts.publishedAt)).limit(1),
  ])

  const poetry = latestPoetry[0]
  const tech   = latestTech[0]
  const ideas  = latestIdeas[0]

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      <SiteNav />

      {/* ── Hero ── */}
      <div style={{ padding: '5rem 2rem 4rem', maxWidth: '760px' }}>
        <span style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--txt3)', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.8rem',
        }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: 'var(--txt4)' }} />
          Poet · Engineer · Tinker
        </span>

        <h1 style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 'clamp(48px, 7.5vw, 88px)',
          fontWeight: 300, lineHeight: 0.98, letterSpacing: '-0.025em',
          marginBottom: '2rem', color: 'var(--txt)',
        }}>
          Words that build<br />
          <em style={{ fontStyle: 'italic', color: 'var(--txt2)' }}>worlds &amp; systems.</em>
        </h1>

        <p style={{
          fontFamily: 'var(--font-source-serif), serif',
          fontSize: '18px', lineHeight: 1.65, color: 'var(--txt2)',
          maxWidth: '44ch', fontWeight: 400,
        }}>
          I write poems, build things, and think too hard about how the world works.
          This is where all of it lives.
        </p>

        <div style={{ width: 48, height: 1, background: 'var(--txt)', marginTop: '3rem' }} />
      </div>

      {/* ── Category label ── */}
      <p style={{
        fontFamily: 'var(--font-dm-mono), monospace',
        fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'var(--txt3)', padding: '0 2rem 1.25rem',
      }}>
        Explore by category
      </p>

      {/* ── Section Cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '0.5px solid var(--bdr)', borderBottom: '0.5px solid var(--bdr)',
      }}>

        {/* Poetry */}
        <div className="hover-bg" style={{
          padding: '2.5rem 2rem 2rem', borderRight: '0.5px solid var(--bdr)',
          position: 'relative', minHeight: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* stretched section link — sits behind all content */}
          <Link href="/poetry" aria-label="Go to Poetry" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                    style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: '15px', display: 'block', position: 'relative', zIndex: 2 }}
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
            <span style={{ position: 'absolute', top: 0, right: 0, fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </div>

        {/* Tech */}
        <div className="hover-bg" style={{
          padding: '2.5rem 2rem 2rem', borderRight: '0.5px solid var(--bdr)',
          position: 'relative', minHeight: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          <Link href="/tech" aria-label="Go to Tech" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                    style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', display: 'block', position: 'relative', zIndex: 2 }}
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
            <span style={{ position: 'absolute', top: 0, right: 0, fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </div>

        {/* Ideas */}
        <div className="hover-bg" style={{
          padding: '2.5rem 2rem 2rem',
          position: 'relative', minHeight: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          <Link href="/ideas" aria-label="Go to Ideas" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                    style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '14px', display: 'block', position: 'relative', zIndex: 2 }}
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
            <span style={{ position: 'absolute', top: 0, right: 0, fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </div>

      </div>

      <SiteFooter />
    </div>
  )
}
