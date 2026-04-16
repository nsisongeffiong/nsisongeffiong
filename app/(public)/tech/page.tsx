export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

interface PostMeta {
  readTime?: number
}

const heroTags: string[] = ['AI/ML', 'systems', 'web', 'devtools']
const chips: string[]    = ['all', 'AI/ML', 'systems', 'web', 'devtools']

function tagStyle(tag: string): CSSProperties {
  const t = tag.toLowerCase()
  if (t === 'devtools' || t === 'python' || t === 'performance') {
    return { background: 'var(--amber-bg)', color: 'var(--amber-txt)' }
  }
  if (t === 'systems' || t === 'web' || t === 'architecture') {
    return { background: 'var(--purple-bg)', color: 'var(--purple-txt)' }
  }
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
    <div style={{ background: 'var(--bg)', color: 'var(--txt)', minHeight: '100vh' }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          borderBottom: '0.5px solid var(--bdr)',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '12px',
            color: 'var(--txt2)',
            textDecoration: 'none',
          }}
        >
          ← nsisongeffiong.com
        </Link>
        <span
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: 'var(--teal-mid)',
          }}
        >
          ~/tech
        </span>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ background: 'var(--teal-hero)', padding: '2.5rem 2rem' }}>
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '12px',
            color: 'var(--teal-comm)',
            marginBottom: '0.4rem',
          }}
        >
          # engineering blog
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 'clamp(22px, 4vw, 38px)',
            fontWeight: 500,
            lineHeight: 1.1,
            color: 'var(--teal-pale)',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
          }}
        >
          ./tech
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '12px',
            color: 'var(--teal-light)',
            lineHeight: 1.75,
            maxWidth: '460px',
            marginBottom: '1.4rem',
          }}
        >
          Deep dives on AI systems, software architecture, and building with emerging tools.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {heroTags.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                padding: '3px 9px',
                border: '0.5px solid var(--teal-comm)',
                color: 'var(--teal-light)',
                borderRadius: '2px',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 2rem',
          background: 'var(--bg2)',
          borderBottom: '0.5px solid var(--bdr)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {chips.map((chip, i) => (
            <span
              key={chip}
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                padding: '3px 10px',
                border: i === 0 ? '0.5px solid var(--teal-light)' : '0.5px solid var(--bdr)',
                borderRadius: '2px',
                color: i === 0 ? 'var(--teal-txt)' : 'var(--txt2)',
                background: i === 0 ? 'var(--teal-pale)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {chip}
            </span>
          ))}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            color: 'var(--txt3)',
          }}
        >
          sort: newest
        </span>
      </div>

      {/* ── Post rows ───────────────────────────────────── */}
      {articles.map((a, i) => (
        <Link
          key={a.id}
          href={`/tech/${a.slug}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '1.4rem',
            padding: '1.4rem 2rem',
            borderBottom: '0.5px solid var(--bdr)',
            alignItems: 'start',
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              color: 'var(--txt3)',
              paddingTop: '2px',
              minWidth: '20px',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>

          <div>
            {(a.tags ?? []).length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.4rem',
                  marginBottom: '0.55rem',
                  flexWrap: 'wrap',
                }}
              >
                {(a.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '10px',
                      padding: '2px 7px',
                      borderRadius: '2px',
                      ...tagStyle(tag),
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h3
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: 1.3,
                marginBottom: '0.4rem',
                letterSpacing: '-0.01em',
                color: 'var(--txt)',
              }}
            >
              {a.title}
            </h3>
            {a.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '11px',
                  color: 'var(--txt2)',
                  lineHeight: 1.65,
                }}
              >
                {a.excerpt}
              </p>
            )}
          </div>

          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              color: 'var(--txt3)',
              whiteSpace: 'nowrap',
              paddingTop: '2px',
            }}
          >
            {a.publishedAt
              ? a.publishedAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : ''}
            {(a.metadata as PostMeta)?.readTime
              ? ` · ${(a.metadata as PostMeta).readTime} min`
              : ''}
          </span>
        </Link>
      ))}

      {/* ── Stats ───────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '0.5px solid var(--bdr)',
        }}
      >
        {[
          { n: String(articles.length),         label: 'articles published' },
          { n: '~7k',                            label: 'avg words / article' },
          { n: String(uniqueTopics.size || 4),   label: 'topics covered' },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            style={{
              padding: '1.25rem 2rem',
              borderRight: i < arr.length - 1 ? '0.5px solid var(--bdr)' : 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '24px',
                fontWeight: 500,
                color: 'var(--teal-mid)',
                marginBottom: '0.2rem',
              }}
            >
              {s.n}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                color: 'var(--txt3)',
                letterSpacing: '0.08em',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
