export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

interface PostMeta { readTime?: number }

const chips: string[] = ['all', 'AI/ML', 'systems', 'web', 'devtools']

function tagStyle(tag: string): CSSProperties {
  const t = tag.toLowerCase()
  if (t === 'devtools' || t === 'python' || t === 'performance')
    return { background: 'var(--amber-bg)', color: 'var(--amber-txt)' }
  if (t === 'systems' || t === 'web' || t === 'architecture')
    return { background: 'var(--purple-bg)', color: 'var(--purple-txt)' }
  return { background: 'var(--teal-pale)', color: 'var(--teal-txt)' }
}

export default async function TechPage() {
  const articles = await db
    .select({
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
    .orderBy(desc(posts.publishedAt))

  const uniqueTopics = new Set(articles.flatMap((a) => a.tags ?? []))

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
            {['AI/ML', 'systems', 'web', 'devtools'].map((t) => (
              <span key={t} style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px', padding: '4px 10px',
                border: '0.5px solid var(--bdr2)', borderRadius: '999px',
                color: 'var(--teal-mid)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', borderBottom: '0.5px solid var(--bdr)',
      }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {chips.map((chip, i) => (
            <button key={chip} style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px', padding: '4px 12px',
              border: '0.5px solid var(--bdr2)', borderRadius: '999px',
              color: i === 0 ? 'var(--bg)' : 'var(--txt2)',
              background: i === 0 ? 'var(--txt)' : 'transparent',
              cursor: 'pointer',
            }}>{chip}</button>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--txt3)' }}>
          sort <span style={{ color: 'var(--txt2)' }}>↓ newest</span>
        </span>
      </div>

      {/* ── Post list ── */}
      {articles.map((a, i) => (
        <Link key={a.id} href={`/tech/${a.slug}`} className="hover-bg" style={{
          display: 'grid', gridTemplateColumns: '3rem 1fr auto',
          gap: '2rem', padding: '1.75rem 2rem',
          borderBottom: '0.5px solid var(--bdr)',
          alignItems: 'start', textDecoration: 'none', color: 'inherit',
        }}>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', color: 'var(--txt3)', paddingTop: '0.5rem',
          }}>{String(i + 1).padStart(2, '0')}</span>

          <div>
            {(a.tags ?? []).length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                {(a.tags ?? []).map((tag) => (
                  <span key={tag} style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                    border: '0.5px solid var(--bdr2)',
                    ...tagStyle(tag),
                  }}>{tag}</span>
                ))}
              </div>
            )}
            <h3 style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '17px', fontWeight: 600, lineHeight: 1.3,
              marginBottom: '0.5rem', letterSpacing: '-0.015em', color: 'var(--txt)',
            }}>{a.title}</h3>
            {a.excerpt && (
              <p style={{
                fontFamily: 'var(--font-source-serif), serif',
                fontSize: '14px', color: 'var(--txt2)',
                lineHeight: 1.65, fontWeight: 300, maxWidth: '60ch',
              }}>{a.excerpt}</p>
            )}
          </div>

          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', color: 'var(--txt3)',
            whiteSpace: 'nowrap', paddingTop: '0.5rem', textAlign: 'right',
          }}>
            {a.publishedAt
              ? a.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : ''}
            {(a.metadata as PostMeta)?.readTime ? ` · ${(a.metadata as PostMeta).readTime} min` : ''}
          </span>
        </Link>
      ))}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { n: String(articles.length),              label: 'articles published' },
          { n: '~7k',                                label: 'avg words / article' },
          { n: String(uniqueTopics.size || 4),       label: 'topics covered' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            padding: '1.75rem 2rem',
            borderRight: i < arr.length - 1 ? '0.5px solid var(--bdr)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '40px', fontWeight: 300,
              color: 'var(--teal-mid)', lineHeight: 1, marginBottom: '0.35rem',
            }}>{s.n}</div>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--txt3)',
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      <SiteFooter section="02 / Tech" />
    </div>
  )
}
