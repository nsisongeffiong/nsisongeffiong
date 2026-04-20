export const dynamic = 'force-dynamic'

import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { HomeSectionCards } from '@/components/shared/HomeSectionCards'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

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
      <HomeSectionCards poetry={poetry} tech={tech} ideas={ideas} />

      <SiteFooter />
    </div>
  )
}
