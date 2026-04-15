export const dynamic = 'force-dynamic'

import { SiteNav } from '@/components/shared/SiteNav'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

const filters = ['all', 'AI/ML', 'systems', 'web', 'devtools']

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

  const stats = [
    { label: 'articles published', value: String(articles.length) },
    { label: 'avg words',          value: '2,400' },
    { label: 'topics covered',     value: '6' },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--txt)',
      }}
    >
      <SiteNav />

      {/* ── Hero ── */}
      <section
        style={{
          background: 'var(--teal-hero)',
          padding: '4rem 1.5rem 3.5rem',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.8rem',
              color: 'var(--teal-mid)',
              marginBottom: '0.5rem',
            }}
          >
            # engineering blog
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontWeight: 400,
              fontSize: 'clamp(2.4rem, 6vw, 3.5rem)',
              lineHeight: 1.1,
              color: 'var(--teal-txt)',
              marginBottom: '1rem',
            }}
          >
            ./tech
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              color: 'var(--teal-txt)',
              maxWidth: '560px',
              marginBottom: '1.5rem',
              opacity: 0.85,
            }}
          >
            Deep dives into AI/ML systems, web infrastructure, and the developer
            tools that make complex work feel simple.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['AI/ML', 'systems', 'web', 'devtools'].map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  border: '1px solid var(--teal-mid)',
                  color: 'var(--teal-mid)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '2px',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter Chips ── */}
      <nav
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '2rem 1.5rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {filters.map((f, i) => (
          <button
            key={f}
            type="button"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: i === 0 ? 'var(--teal-hero)' : 'transparent',
              color: i === 0 ? 'var(--teal-mid)' : 'var(--txt-secondary)',
              border:
                i === 0
                  ? '1px solid var(--teal-hero)'
                  : '1px solid var(--bdr)',
              borderRadius: '2px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </nav>

      {/* ── Article List ── */}
      <section
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '1rem 1.5rem 4rem',
        }}
      >
        {articles.map((a, i) => (
          <article
            key={a.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '3rem 1fr',
              gap: '1.5rem',
              padding: '2rem 0',
              borderBottom: '0.5px solid var(--bdr)',
            }}
          >
            {/* Number */}
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '1.5rem',
                fontWeight: 400,
                color: 'var(--teal-mid)',
                lineHeight: 1,
                paddingTop: '0.15rem',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {a.tags?.[0] && (
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--teal-hero)',
                    border: '1px solid var(--teal-hero)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '2px',
                    alignSelf: 'flex-start',
                  }}
                >
                  {a.tags[0]}
                </span>
              )}
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 700,
                  fontSize: '1.35rem',
                  lineHeight: 1.25,
                  color: 'var(--txt)',
                }}
              >
                <a
                  href={`/tech/${a.slug}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {a.title}
                </a>
              </h2>
              {a.excerpt && (
                <p
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.8rem',
                    lineHeight: 1.7,
                    color: 'var(--txt-secondary)',
                  }}
                >
                  {a.excerpt}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  color: 'var(--txt-secondary)',
                }}
              >
                {a.publishedAt && (
                  <time dateTime={a.publishedAt.toISOString()}>
                    {a.publishedAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                )}
                {(a.metadata as any)?.readTime && (
                  <span>{(a.metadata as any).readTime} min read</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ── Stats Bar ── */}
      <section
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '0.5px solid var(--bdr)',
            borderBottom: '0.5px solid var(--bdr)',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                borderRight:
                  i < stats.length - 1 ? '0.5px solid var(--bdr)' : 'none',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '2rem',
                  fontWeight: 400,
                  color: 'var(--teal-mid)',
                  marginBottom: '0.35rem',
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--txt-secondary)',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
