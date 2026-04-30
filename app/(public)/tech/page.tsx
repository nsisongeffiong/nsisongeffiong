export const dynamic = 'force-dynamic'

import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { TechPostList } from '@/components/tech/TechPostList'
import { db } from '@/lib/db'
import { posts, topics, topicTags } from '@/lib/db/schema'
import { desc, eq, and, asc } from 'drizzle-orm'

async function getTechTopics() {
  const rows = await db
    .select({ id: topics.id, label: topics.label, tag: topicTags.tag })
    .from(topics)
    .leftJoin(topicTags, eq(topicTags.topicId, topics.id))
    .where(eq(topics.section, 'tech'))
    .orderBy(asc(topics.position))

  const map = new Map<string, { id: string; label: string; tags: string[] }>()
  for (const row of rows) {
    if (!map.has(row.id)) map.set(row.id, { id: row.id, label: row.label, tags: [] })
    if (row.tag) map.get(row.id)!.tags.push(row.tag)
  }
  return Array.from(map.values())
}

export default async function TechPage() {
  const [articles, techTopics] = await Promise.all([
    db.select({
      id:          posts.id,
      title:       posts.title,
      slug:        posts.slug,
      excerpt:     posts.excerpt,
      tags:        posts.tags,
      publishedAt: posts.publishedAt,
      metadata:    posts.metadata,
    })
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.type, 'tech')))
    .orderBy(desc(posts.publishedAt)),
    getTechTopics(),
  ])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)',  }}>
      <SiteNav />

      {/* ── Hero — surface, no full-bleed green ── */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        gap: '3rem', alignItems: 'end',
        padding: '4rem 2rem 3rem',
        borderBottom: '0.5px solid var(--bdr)',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', letterSpacing: '0.08em',
            color: 'var(--teal-mid)', marginBottom: '1rem', display: 'block',
          }}># engineering notes</span>
          <h1 style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 400, letterSpacing: '-0.04em',
            lineHeight: 0.95, color: 'var(--txt)', marginBottom: '1.25rem',
          }}>
            <span style={{ color: 'var(--teal-mid)' }}>./</span>tech
          </h1>
          <p style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '16px', lineHeight: 1.55,
            color: 'var(--txt2)', maxWidth: '48ch',
          }}>
            Deep dives on AI systems, software architecture, and building with emerging tools.
          </p>
        </div>
        <div className="tech-hero-right" style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt3)',
          }}>Topics</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 200 }}>
            {techTopics.map((t) => (
              <span key={t.id} style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px', padding: '4px 10px',
                border: '0.5px solid var(--bdr2)', borderRadius: '999px',
                color: 'var(--teal-mid)',
              }}>{t.label}</span>
            ))}
          </div>
        </div>
      </section>

      <TechPostList posts={articles} topics={techTopics} />

      <SiteFooter section="02 / Tech" />
    </div>
  )
}
