export const dynamic = 'force-dynamic'

import { SiteNav } from '@/components/shared/SiteNav'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

const categories = [
  'All',
  'Nature & place',
  'Memory',
  'Language & form',
  'Grief',
  'Politics',
]

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

  const featured = poems[0]
  const rest     = poems.slice(1)

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
          textAlign: 'center',
          padding: '5rem 1.5rem 3rem',
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(3rem, 7vw, 5rem)',
            lineHeight: 1.05,
            color: 'var(--txt)',
            marginBottom: '1rem',
          }}
        >
          Poetry
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '1.15rem',
            color: 'var(--txt-secondary)',
            lineHeight: 1.6,
          }}
        >
          Verses on memory, landscape, and the silence between words — each poem
          a small act of naming.
        </p>
      </section>

      {/* ── Category Filter ── */}
      <nav
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '0 1.5rem 2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {categories.map((cat, i) => (
          <button
            key={cat}
            type="button"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: i === 0 ? 'var(--purple-acc)' : 'transparent',
              color: i === 0 ? 'var(--bg)' : 'var(--txt-secondary)',
              border:
                i === 0
                  ? '1px solid var(--purple-acc)'
                  : '1px solid var(--bdr)',
              borderRadius: '2px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* ── Featured Poem ── */}
      {featured && (
        <section
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '0 1.5rem 4rem',
          }}
        >
          <a
            href={`/poetry/${featured.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                background: 'var(--bg2)',
                padding: '2.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2.5rem',
              }}
            >
              {/* Left: Title & excerpt */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--purple-acc)',
                  }}
                >
                  Featured
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: '2rem',
                    lineHeight: 1.15,
                    color: 'var(--txt)',
                  }}
                >
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p
                    style={{
                      fontFamily: 'var(--font-cormorant), serif',
                      fontStyle: 'italic',
                      fontWeight: 300,
                      fontSize: '1rem',
                      lineHeight: 1.7,
                      color: 'var(--txt-secondary)',
                    }}
                  >
                    {featured.excerpt}
                  </p>
                )}
                {featured.tags?.[0] && (
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--purple-acc)',
                      border: '1px solid var(--purple-acc)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '2px',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {featured.tags[0]}
                  </span>
                )}
              </div>

              {/* Right: Verse excerpt from content */}
              <div
                style={{
                  borderLeft: '3px solid var(--purple-acc)',
                  paddingLeft: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: '1.1rem',
                    lineHeight: 1.9,
                    color: 'var(--txt)',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: featured.content?.slice(0, 400) ?? '',
                  }}
                />
              </div>
            </div>
          </a>
        </section>
      )}

      {/* ── Poem Card Grid ── */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 1.5rem 5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {rest.map((poem) => (
          <article
            key={poem.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingBottom: '2rem',
              borderBottom: '0.5px solid var(--bdr)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '1rem',
                letterSpacing: '0.5em',
                color: 'var(--purple-acc)',
                userSelect: 'none',
              }}
              aria-hidden="true"
            >
              · · ·
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '1.5rem',
                lineHeight: 1.2,
                color: 'var(--txt)',
              }}
            >
              <a
                href={`/poetry/${poem.slug}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {poem.title}
              </a>
            </h3>
            {poem.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'var(--txt-secondary)',
                }}
              >
                {poem.excerpt}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
              }}
            >
              {poem.publishedAt && (
                <time
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.7rem',
                    color: 'var(--txt-secondary)',
                  }}
                  dateTime={poem.publishedAt.toISOString()}
                >
                  {poem.publishedAt.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              )}
              {poem.tags?.[0] && (
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--purple-acc)',
                    border: '1px solid var(--purple-acc)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '2px',
                  }}
                >
                  {poem.tags[0]}
                </span>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
