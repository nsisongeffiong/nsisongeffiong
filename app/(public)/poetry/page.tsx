export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { formatDate } from '@/lib/utils'

export default async function PoetryPage() {
  const allPoems = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      tags: posts.tags,
      publishedAt: posts.publishedAt,
      metadata: posts.metadata,
    })
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.type, 'poetry')))
    .orderBy(desc(posts.publishedAt))

  const featured = allPoems[0] || null
  const grid = allPoems.slice(1)

  return (
    <main>
      {/* ── Section header ── */}
      <header
        style={{
          textAlign: 'center',
          padding: '5rem 1.5rem 3rem',
          maxWidth: '38rem',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--fg)',
            marginBottom: '1rem',
          }}
        >
          Poetry
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '1.15rem',
            fontStyle: 'italic',
            fontWeight: 300,
            color: 'var(--fg2)',
            lineHeight: 1.7,
          }}
        >
          Verse as vessel — language stretched thin until light shows through.
        </p>
      </header>

      {/* ── Featured poem ── */}
      {featured && (
        <section
          style={{
            maxWidth: '38rem',
            margin: '0 auto 4rem',
            padding: '0 1.5rem',
            textAlign: 'center',
          }}
        >
          <Link
            href={`/poetry/${featured.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--purple-acc)',
              }}
            >
              {(featured.metadata as any)?.category || featured.tags?.[0] || 'latest'}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '1.75rem',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--fg)',
                margin: '0.5rem 0',
                lineHeight: 1.3,
              }}
            >
              {featured.title}
            </h2>
            {featured.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--fg2)',
                  lineHeight: 1.7,
                  marginTop: '0.75rem',
                }}
              >
                {featured.excerpt}
              </p>
            )}
            {featured.publishedAt && (
              <time
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.75rem',
                  color: 'var(--fg2)',
                  display: 'block',
                  marginTop: '1rem',
                }}
              >
                {formatDate(featured.publishedAt)}
              </time>
            )}
          </Link>
        </section>
      )}

      {/* ── Divider ── */}
      <hr
        style={{
          border: 'none',
          borderTop: '0.5px solid var(--bdr)',
          maxWidth: '38rem',
          margin: '0 auto 3rem',
        }}
      />

      {/* ── Poetry grid ── */}
      {grid.length > 0 && (
        <section
          style={{
            maxWidth: '52rem',
            margin: '0 auto',
            padding: '0 1.5rem 5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
            gap: '2.5rem 2rem',
          }}
        >
          {grid.map((poem) => (
            <Link
              key={poem.id}
              href={`/poetry/${poem.slug}`}
              style={{
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
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
                {(poem.metadata as any)?.category || poem.tags?.[0] || ''}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.25rem',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: 'var(--fg)',
                  margin: '0.35rem 0',
                  lineHeight: 1.3,
                }}
              >
                {poem.title}
              </h3>
              {poem.excerpt && (
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '0.95rem',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: 'var(--fg2)',
                    lineHeight: 1.6,
                    marginTop: '0.5rem',
                  }}
                >
                  {poem.excerpt}
                </p>
              )}
              {poem.publishedAt && (
                <time
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.7rem',
                    color: 'var(--fg2)',
                    display: 'block',
                    marginTop: '0.75rem',
                  }}
                >
                  {formatDate(poem.publishedAt)}
                </time>
              )}
            </Link>
          ))}
        </section>
      )}

      {allPoems.length === 0 && (
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-cormorant), serif',
            fontStyle: 'italic',
            color: 'var(--fg2)',
            padding: '4rem 1.5rem',
          }}
        >
          No poems yet — check back soon.
        </p>
      )}
    </main>
  )
}
