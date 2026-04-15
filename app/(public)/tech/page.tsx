export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { formatDate } from '@/lib/utils'

export default async function TechPage() {
  const techPosts = await db
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
    .where(and(eq(posts.published, true), eq(posts.type, 'tech')))
    .orderBy(desc(posts.publishedAt))

  return (
    <main>
      {/* ── Hero bar ── */}
      <header
        style={{
          background: 'var(--teal-hero)',
          padding: '3rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#9FE1CB',
              marginBottom: '0.5rem',
            }}
          >
            Tech
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.9rem',
              color: '#9FE1CB',
              opacity: 0.8,
            }}
          >
            Systems, code, and the craft of building things that work.
          </p>
        </div>
      </header>

      {/* ── Stats bar ── */}
      <div
        style={{
          borderBottom: '1px solid var(--bdr)',
          padding: '1rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '64rem',
            margin: '0 auto',
            display: 'flex',
            gap: '2rem',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '0.75rem',
            color: 'var(--fg2)',
          }}
        >
          <span>{techPosts.length} articles</span>
          <span>topics: varied</span>
        </div>
      </div>

      {/* ── Post list ── */}
      <section
        style={{
          maxWidth: '64rem',
          margin: '0 auto',
          padding: '2rem 1.5rem 5rem',
        }}
      >
        {techPosts.length === 0 && (
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              color: 'var(--fg2)',
              padding: '3rem 0',
              textAlign: 'center',
            }}
          >
            No posts yet — check back soon.
          </p>
        )}

        {techPosts.map((post, i) => (
          <Link
            key={post.id}
            href={`/tech/${post.slug}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '3rem 1fr auto',
              gap: '1rem',
              alignItems: 'baseline',
              padding: '1.25rem 0',
              borderBottom: '1px solid var(--bdr)',
              textDecoration: 'none',
            }}
          >
            {/* Number */}
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.8rem',
                color: 'var(--fg2)',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Title + excerpt */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--fg)',
                  lineHeight: 1.3,
                }}
              >
                {post.title}
              </h2>
              {post.excerpt && (
                <p
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.8rem',
                    color: 'var(--fg2)',
                    marginTop: '0.3rem',
                    lineHeight: 1.5,
                  }}
                >
                  {post.excerpt}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '0.65rem',
                        color: 'var(--teal-hero)',
                        border: '1px solid var(--teal-hero)',
                        borderRadius: '2px',
                        padding: '0.1rem 0.4rem',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Meta */}
            <div
              style={{
                textAlign: 'right',
                whiteSpace: 'nowrap',
              }}
            >
              {post.publishedAt && (
                <time
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.7rem',
                    color: 'var(--fg2)',
                    display: 'block',
                  }}
                >
                  {formatDate(post.publishedAt)}
                </time>
              )}
              {(post.metadata as any)?.readTime && (
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    color: 'var(--fg2)',
                    display: 'block',
                    marginTop: '0.2rem',
                  }}
                >
                  {(post.metadata as any).readTime}
                </span>
              )}
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
