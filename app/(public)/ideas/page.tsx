export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { formatDate } from '@/lib/utils'

export default async function IdeasPage() {
  const ideasPosts = await db
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
    .where(and(eq(posts.published, true), eq(posts.type, 'ideas')))
    .orderBy(desc(posts.publishedAt))

  const lead = ideasPosts[0] || null
  const sidebar = ideasPosts.slice(1, 4)
  const cards = ideasPosts.slice(4)

  return (
    <main>
      {/* ── Section header ── */}
      <header
        style={{
          padding: '5rem 1.5rem 3rem',
          maxWidth: '64rem',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            color: 'var(--fg)',
            marginBottom: '0.5rem',
          }}
        >
          Ideas
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-source-serif), serif',
            fontSize: '1.1rem',
            color: 'var(--fg2)',
            lineHeight: 1.7,
            maxWidth: '42ch',
          }}
        >
          Long-form essays on culture, technology, language, and the
          intersections between them.
        </p>
      </header>

      {/* ── Lead essay + sidebar ── */}
      {lead && (
        <section
          style={{
            maxWidth: '64rem',
            margin: '0 auto',
            padding: '0 1.5rem 3rem',
            display: 'grid',
            gridTemplateColumns: sidebar.length > 0 ? '2fr 1fr' : '1fr',
            gap: '3rem',
          }}
        >
          {/* Lead */}
          <Link
            href={`/ideas/${lead.slug}`}
            style={{
              textDecoration: 'none',
              display: 'block',
              borderTop: '2px solid var(--amber)',
              paddingTop: '1.5rem',
            }}
          >
            {(lead.metadata as any)?.kicker && (
              <span
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--amber)',
                }}
              >
                {(lead.metadata as any).kicker}
              </span>
            )}
            <h2
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--fg)',
                margin: '0.5rem 0',
                lineHeight: 1.25,
              }}
            >
              {lead.title}
            </h2>
            {lead.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontSize: '1.05rem',
                  color: 'var(--fg2)',
                  lineHeight: 1.7,
                  marginTop: '0.75rem',
                }}
              >
                {lead.excerpt}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                color: 'var(--fg2)',
              }}
            >
              {lead.publishedAt && (
                <time>{formatDate(lead.publishedAt)}</time>
              )}
              {(lead.metadata as any)?.volume && (
                <span>{(lead.metadata as any).volume}</span>
              )}
            </div>
          </Link>

          {/* Sidebar */}
          {sidebar.length > 0 && (
            <div
              style={{
                borderTop: '1px solid var(--bdr)',
                paddingTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {sidebar.map((post) => (
                <Link
                  key={post.id}
                  href={`/ideas/${post.slug}`}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    paddingBottom: '1.5rem',
                    borderBottom: '0.5px solid var(--bdr)',
                  }}
                >
                  {(post.metadata as any)?.kicker && (
                    <span
                      style={{
                        fontFamily: 'var(--font-syne), sans-serif',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--amber)',
                      }}
                    >
                      {(post.metadata as any).kicker}
                    </span>
                  )}
                  <h3
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--fg)',
                      margin: '0.25rem 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {post.title}
                  </h3>
                  {post.publishedAt && (
                    <time
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '0.65rem',
                        color: 'var(--fg2)',
                      }}
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Divider ── */}
      {cards.length > 0 && (
        <hr
          style={{
            border: 'none',
            borderTop: '0.5px solid var(--bdr)',
            maxWidth: '64rem',
            margin: '0 auto 3rem',
          }}
        />
      )}

      {/* ── Cards grid ── */}
      {cards.length > 0 && (
        <section
          style={{
            maxWidth: '64rem',
            margin: '0 auto',
            padding: '0 1.5rem 5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
            gap: '2rem',
          }}
        >
          {cards.map((post) => (
            <Link
              key={post.id}
              href={`/ideas/${post.slug}`}
              style={{
                textDecoration: 'none',
                display: 'block',
                borderTop: '1px solid var(--bdr)',
                paddingTop: '1.25rem',
              }}
            >
              {(post.metadata as any)?.kicker && (
                <span
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--amber)',
                  }}
                >
                  {(post.metadata as any).kicker}
                </span>
              )}
              <h3
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--fg)',
                  margin: '0.3rem 0',
                  lineHeight: 1.3,
                }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  style={{
                    fontFamily: 'var(--font-source-serif), serif',
                    fontSize: '0.9rem',
                    color: 'var(--fg2)',
                    lineHeight: 1.6,
                    marginTop: '0.5rem',
                  }}
                >
                  {post.excerpt}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '0.75rem',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  color: 'var(--fg2)',
                }}
              >
                {post.publishedAt && (
                  <time>{formatDate(post.publishedAt)}</time>
                )}
                {(post.metadata as any)?.volume && (
                  <span>{(post.metadata as any).volume}</span>
                )}
              </div>
            </Link>
          ))}
        </section>
      )}

      {ideasPosts.length === 0 && (
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-source-serif), serif',
            color: 'var(--fg2)',
            padding: '4rem 1.5rem',
          }}
        >
          No essays yet — check back soon.
        </p>
      )}
    </main>
  )
}
