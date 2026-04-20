export const dynamic = 'force-dynamic'

import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import Link from 'next/link'

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default async function HomePage() {
  const [latestPoetry, latestTech, latestIdeas] = await Promise.all([
    db.select({ id: posts.id, title: posts.title, slug: posts.slug })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'poetry')))
      .orderBy(desc(posts.publishedAt)).limit(1),
    db.select({ id: posts.id, title: posts.title, slug: posts.slug })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'tech')))
      .orderBy(desc(posts.publishedAt)).limit(1),
    db.select({ id: posts.id, title: posts.title, slug: posts.slug })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'ideas')))
      .orderBy(desc(posts.publishedAt)).limit(1),
  ])

  const sectionIds = new Set([
    latestPoetry[0]?.id,
    latestTech[0]?.id,
    latestIdeas[0]?.id,
  ].filter(Boolean))

  const recentRaw = await db
    .select({ id: posts.id, type: posts.type, title: posts.title, slug: posts.slug, publishedAt: posts.publishedAt })
    .from(posts).where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt)).limit(6)

  const recentPosts = recentRaw
    .filter((p) => !sectionIds.has(p.id))
    .slice(0, 3)
    .map((p) => ({
    type:  p.type.charAt(0).toUpperCase() + p.type.slice(1),
    title: p.title,
    date:  p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : '',
    href:  `/${p.type}/${p.slug}`,
    raw:   p.type,
  }))

  return (
    <div style={{  background: 'var(--bg)', color: 'var(--txt)' }}>
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
        <Link href="/poetry" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="hover-bg" style={{
            padding: '2.5rem 2rem 2rem', borderRight: '0.5px solid var(--bdr)',
            position: 'relative', minHeight: 320,
            display: 'flex', flexDirection: 'column',
          }}>
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
              <p style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: '15px', color: 'var(--txt)' }}>
                {latestPoetry[0]?.title ? `"${latestPoetry[0].title}"` : '—'}
              </p>
            </div>
            <span style={{ position: 'absolute', top: '2.5rem', right: '2rem', fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </Link>

        {/* Tech */}
        <Link href="/tech" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="hover-bg" style={{
            padding: '2.5rem 2rem 2rem', borderRight: '0.5px solid var(--bdr)',
            position: 'relative', minHeight: 320,
            display: 'flex', flexDirection: 'column',
          }}>
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
              <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', color: 'var(--txt)' }}>
                {latestTech[0]?.title ?? '—'}
              </p>
            </div>
            <span style={{ position: 'absolute', top: '2.5rem', right: '2rem', fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </Link>

        {/* Ideas */}
        <Link href="/ideas" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="hover-bg" style={{
            padding: '2.5rem 2rem 2rem',
            position: 'relative', minHeight: 320,
            display: 'flex', flexDirection: 'column',
          }}>
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
              <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '14px', color: 'var(--txt)' }}>
                {latestIdeas[0]?.title ?? '—'}
              </p>
            </div>
            <span style={{ position: 'absolute', top: '2.5rem', right: '2rem', fontSize: '16px', color: 'var(--txt3)' }}>↗</span>
          </div>
        </Link>
      </div>

      {/* ── Recent Posts ── */}
      <div style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: '1.5rem',
        }}>
          <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt3)' }}>
            Recent across all categories
          </span>
          <Link href="/archive" style={{ fontSize: '13px', color: 'var(--txt2)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '0.5px solid var(--bdr)' }}>
          {recentPosts.map((post) => {
            const accentColor = post.raw === 'poetry' ? 'var(--purple)' : post.raw === 'tech' ? 'var(--teal-mid)' : 'var(--amber)'
            return (
              <Link key={post.href} href={post.href} style={{ textDecoration: 'none' }}>
                <div className="hover-bg" style={{
                  padding: '1.25rem 1.5rem',
                  borderRight: '0.5px solid var(--bdr)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: accentColor, display: 'block', marginBottom: '0.5rem',
                  }}>{post.type}</span>
                  <span style={{
                    fontFamily: post.raw === 'poetry' ? 'var(--font-cormorant), serif' : post.raw === 'tech' ? 'var(--font-dm-mono), monospace' : 'var(--font-syne), sans-serif',
                    fontStyle: post.raw === 'poetry' ? 'italic' : 'normal',
                    fontWeight: post.raw === 'ideas' ? 600 : 400,
                    fontSize: post.raw === 'poetry' ? '17px' : post.raw === 'tech' ? '13px' : '15px',
                    color: 'var(--txt)', display: 'block', marginBottom: '0.5rem',
                    lineHeight: 1.3,
                  }}>{post.title}</span>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '11px', color: 'var(--txt3)', display: 'block',
                  }}>{post.date ? formatDate(post.date) : ''}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
