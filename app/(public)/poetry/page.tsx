export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

const categories: string[] = [
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
            fontFamily: 'var(--font-cormorant), serif',
            fontStyle: 'italic',
            fontSize: '13px',
            color: 'var(--txt2)',
            textDecoration: 'none',
          }}
        >
          ← nsisongeffiong.com
        </Link>
        <span
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '12px',
            letterSpacing: '0.18em',
            color: 'var(--purple)',
          }}
        >
          Poetry
        </span>
      </nav>

      {/* ── Heading ─────────────────────────────────────── */}
      <h1
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 'clamp(56px, 9vw, 90px)',
          fontWeight: 300,
          fontStyle: 'italic',
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          color: 'var(--txt)',
          padding: '3rem 2rem 0',
        }}
      >
        Poetry
      </h1>

      {/* ── Subtitle ─────────────────────────────────────── */}
      <p
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: '15px',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--txt2)',
          marginTop: '1.4rem',
          maxWidth: '380px',
          lineHeight: 1.8,
          padding: '0 2rem',
        }}
      >
        Verse as a way of knowing. Language pressed into unfamiliar shapes to say what prose cannot.
      </p>

      {/* ── Rule ─────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '0.5px',
          background: 'var(--bdr)',
          margin: '2.25rem 0 0',
        }}
      />

      {/* ── Filter bar ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '1.6rem',
          padding: '1rem 2rem',
          borderBottom: '0.5px solid var(--bdr)',
          overflowX: 'auto',
        }}
      >
        {categories.map((cat, i) => (
          <span
            key={cat}
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: i === 0 ? 'var(--purple)' : 'var(--txt3)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderBottom: i === 0 ? '1px solid var(--purple)' : undefined,
              paddingBottom: i === 0 ? '2px' : undefined,
            }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '0.5px solid var(--bdr)',
        }}
      >
        {/* Featured poem — spans both columns */}
        {featured && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '2.25rem 2rem',
              borderBottom: '0.5px solid var(--bdr)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.25rem',
              alignItems: 'center',
              background: 'var(--bg2)',
            }}
          >
            {/* Left: label, title, excerpt, read link */}
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--purple-acc)',
                  marginBottom: '0.85rem',
                }}
              >
                Featured poem
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: 'clamp(26px, 4vw, 42px)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  lineHeight: 1.1,
                  marginBottom: '0.85rem',
                  color: 'var(--txt)',
                }}
              >
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: 'var(--txt2)',
                    lineHeight: 1.85,
                  }}
                >
                  {featured.excerpt}
                </p>
              )}
              <Link
                href={`/poetry/${featured.slug}`}
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--purple)',
                  marginTop: '1.1rem',
                  display: 'inline-block',
                  textDecoration: 'none',
                }}
              >
                Read poem →
              </Link>
            </div>

            {/* Right: verse excerpt */}
            <div
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '16px',
                fontStyle: 'italic',
                fontWeight: 300,
                lineHeight: 2,
                color: 'var(--txt)',
                borderLeft: '2px solid var(--purple-acc)',
                paddingLeft: '1.25rem',
              }}
              dangerouslySetInnerHTML={{
                __html: featured.content?.slice(0, 400) ?? '',
              }}
            />
          </div>
        )}

        {/* Poem cards */}
        {rest.map((poem, index) => (
          <Link
            key={poem.id}
            href={`/poetry/${poem.slug}`}
            style={{
              display: 'block',
              padding: '1.85rem 2rem',
              // psgrid children: featured is child 1, cards start at child 2.
              // nth-child(even) → no border-right.  rest[0]=child2=even, rest[1]=child3=odd, …
              borderRight: index % 2 === 0 ? 'none' : '0.5px solid var(--bdr)',
              borderBottom: '0.5px solid var(--bdr)',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: 'var(--purple-acc)',
                marginBottom: '1.1rem',
              }}
            >
              · · ·
            </p>
            <h3
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: 'clamp(18px, 2.8vw, 26px)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.2,
                marginBottom: '1rem',
                color: 'var(--txt)',
              }}
            >
              {poem.title}
            </h3>
            {poem.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--txt2)',
                  lineHeight: 1.8,
                  marginBottom: '1.1rem',
                }}
              >
                {poem.excerpt}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {poem.publishedAt && (
                <time
                  dateTime={poem.publishedAt.toISOString()}
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '11px',
                    color: 'var(--txt3)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {poem.publishedAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              )}
              {poem.tags?.[0] && (
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--purple)',
                    background: 'var(--purple-bg)',
                    padding: '2px 8px',
                    borderRadius: '2px',
                  }}
                >
                  {poem.tags[0]}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
