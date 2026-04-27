export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { PoetryPostList } from '@/components/poetry/PoetryPostList'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

export default async function PoetryPage() {
  const poems = await db
    .select({
      id:          posts.id,
      title:       posts.title,
      slug:        posts.slug,
      excerpt:     posts.excerpt,
      tags:        posts.tags,
      publishedAt: posts.publishedAt,
      metadata:    posts.metadata,
      content:     posts.content,
    })
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.type, 'poetry')))
    .orderBy(desc(posts.publishedAt))

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)',  }}>
      <SiteNav />

      {/* ── Hero ── */}
      <section style={{ padding: '4rem 2rem 3rem', borderBottom: '0.5px solid var(--bdr)' }}>
        <span style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--purple)', marginBottom: '1.5rem', display: 'block',
        }}>
          01 · The literary space
        </span>
        <h1 style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 'clamp(56px, 10vw, 120px)',
          fontWeight: 300, fontStyle: 'italic',
          lineHeight: 0.9, letterSpacing: '-0.03em',
          marginBottom: '1.5rem', color: 'var(--txt)',
        }}>
          Poetry
        </h1>
        <p style={{
          fontFamily: 'var(--font-source-serif), serif',
          fontSize: '18px', fontStyle: 'italic', fontWeight: 300,
          color: 'var(--txt2)', maxWidth: '44ch', lineHeight: 1.7,
        }}>
          Grief, memory, love. And the indifference of the natural world.
        </p>
      </section>

      <PoetryPostList poems={poems} />

      <SiteFooter section="01 / Poetry" />
    </div>
  )
}
