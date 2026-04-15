import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { formatDate } from '@/lib/utils'

export default async function HomePage() {
  const recentPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      type: posts.type,
      slug: posts.slug,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt))
    .limit(6)

  return (
    <main>
      {/* ── Hero ── */}
      <section
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '4rem 1.5rem',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 1.15,
            color: 'var(--fg)',
            marginBottom: '1.5rem',
          }}
        >
          Nsisong Effiong
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-source-serif), serif',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--fg2)',
            maxWidth: '36ch',
            lineHeight: 1.7,
            marginBottom: '3rem',
          }}
        >
          Poet, engineer, essayist — exploring the places where
          language meets logic and wonder meets rigour.
        </p>

        <nav
          style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { href: '/poetry', label: 'Poetry', font: 'var(--font-cormorant), serif' },
            { href: '/tech', label: 'Tech', font: 'var(--font-dm-mono), monospace' },
            { href: '/ideas', label: 'Ideas', font: 'var(--font-source-serif), serif' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: link.font,
                fontSize: '1.1rem',
                color: 'var(--fg)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--bdr)',
                paddingBottom: '0.25rem',
                transition: 'border-color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </section>

      {/* ── Recent work strip ── */}
      {recentPosts.length > 0 && (
        <section
          style={{
            padding: '3rem 1.5rem 5rem',
            maxWidth: '72rem',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--fg2)',
              marginBottom: '2rem',
            }}
          >
            Recent
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
              gap: '1.5rem',
            }}
          >
            {recentPosts.map((post) => {
              const sectionPath =
                post.type === 'poetry'
                  ? '/poetry'
                  : post.type === 'tech'
                    ? '/tech'
                    : '/ideas'

              const typeStyles: Record<string, { color: string; font: string }> = {
                poetry: {
                  color: 'var(--purple-acc)',
                  font: 'var(--font-cormorant), serif',
                },
                tech: {
                  color: 'var(--teal-hero)',
                  font: 'var(--font-dm-mono), monospace',
                },
                ideas: {
                  color: 'var(--amber)',
                  font: 'var(--font-source-serif), serif',
                },
              }

              const style = typeStyles[post.type] || typeStyles.ideas

              return (
                <Link
                  key={post.id}
                  href={`${sectionPath}/${post.slug}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    padding: '1.25rem 0',
                    borderTop: '1px solid var(--bdr)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: style.color,
                    }}
                  >
                    {post.type}
                  </span>
                  <h3
                    style={{
                      fontFamily: style.font,
                      fontSize: '1.15rem',
                      fontWeight: 400,
                      color: 'var(--fg)',
                      marginTop: '0.35rem',
                      lineHeight: 1.35,
                    }}
                  >
                    {post.title}
                  </h3>
                  {post.publishedAt && (
                    <time
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '0.75rem',
                        color: 'var(--fg2)',
                        marginTop: '0.5rem',
                        display: 'block',
                      }}
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
