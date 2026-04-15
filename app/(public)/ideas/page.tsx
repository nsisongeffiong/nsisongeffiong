export const dynamic = 'force-dynamic'

import { SiteNav } from '@/components/shared/SiteNav'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

const topics = [
  'All',
  'Governance',
  'Education',
  'Urban Policy',
  'Public Health',
  'Economics',
]

export default async function IdeasPage() {
  const essays = await db
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
    .where(and(eq(posts.published, true), eq(posts.type, 'ideas')))
    .orderBy(desc(posts.publishedAt))

  const leadEssay    = essays[0]
  const sidebarEssays = essays.slice(1, 4)
  const essayGrid    = essays.slice(4)

  const pullQuote = leadEssay
    ? {
        text: leadEssay.excerpt ?? 'Writing on governance, technology in society, and ideas that deserve more friction.',
        attribution: `— from "${leadEssay.title}"`,
      }
    : {
        text: 'The most dangerous policy is the one that sounds like common sense but has never been tested against the lives it claims to improve.',
        attribution: '— Nsisong Effiong',
      }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--txt)',
      }}
    >
      <SiteNav />

      {/* ── Masthead ── */}
      <section
        style={{
          maxWidth: '1060px',
          margin: '0 auto',
          padding: '4rem 1.5rem 2rem',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--amber)',
            marginBottom: '0.5rem',
          }}
        >
          Essays · Policy · Public Thought
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingBottom: '1rem',
            borderBottom: '3px solid var(--txt)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(3.5rem, 8vw, 5rem)',
              lineHeight: 1,
              color: 'var(--txt)',
            }}
          >
            Ideas
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--txt-secondary)',
              letterSpacing: '0.05em',
            }}
          >
            {leadEssay ? ((leadEssay.metadata as any)?.volume ?? 'Vol. I') + ' — ' + (leadEssay.publishedAt?.getFullYear() ?? new Date().getFullYear()) : 'Vol. I'}
          </span>
        </div>
      </section>

      {/* ── Top Grid: Lead + Sidebar ── */}
      {leadEssay && (
        <section
          style={{
            maxWidth: '1060px',
            margin: '0 auto',
            padding: '2rem 1.5rem 3rem',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '0',
          }}
        >
          {/* Lead essay */}
          <article
            style={{
              paddingRight: '2.5rem',
              borderRight: '0.5px solid var(--bdr)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--amber)',
              }}
            >
              {(leadEssay.metadata as any)?.kicker ?? leadEssay.tags?.[0] ?? 'Essay'}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 700,
                fontSize: '1.85rem',
                lineHeight: 1.2,
                color: 'var(--txt)',
              }}
            >
              <a
                href={`/ideas/${leadEssay.slug}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {leadEssay.title}
              </a>
            </h2>
            {leadEssay.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontSize: '1.05rem',
                  lineHeight: 1.75,
                  color: 'var(--txt-secondary)',
                }}
              >
                {leadEssay.excerpt}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                color: 'var(--txt-secondary)',
                marginTop: 'auto',
              }}
            >
              {leadEssay.publishedAt && (
                <time dateTime={leadEssay.publishedAt.toISOString()}>
                  {leadEssay.publishedAt.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              )}
              {(leadEssay.metadata as any)?.readTime && (
                <span>{(leadEssay.metadata as any).readTime} min</span>
              )}
              {(leadEssay.metadata as any)?.volume && (
                <span style={{ color: 'var(--amber)' }}>
                  {(leadEssay.metadata as any).volume}
                </span>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside
            style={{
              paddingLeft: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}
          >
            {sidebarEssays.map((essay, i) => (
              <article
                key={essay.id}
                style={{
                  padding: '1.25rem 0',
                  borderBottom:
                    i < sidebarEssays.length - 1
                      ? '0.5px solid var(--bdr)'
                      : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--amber)',
                  }}
                >
                  {(essay.metadata as any)?.kicker ?? essay.tags?.[0] ?? 'Essay'}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    lineHeight: 1.3,
                    color: 'var(--txt)',
                  }}
                >
                  <a
                    href={`/ideas/${essay.slug}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {essay.title}
                  </a>
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    color: 'var(--txt-secondary)',
                  }}
                >
                  {essay.publishedAt && (
                    <time dateTime={essay.publishedAt.toISOString()}>
                      {essay.publishedAt.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  )}
                  {(essay.metadata as any)?.readTime && (
                    <span>{(essay.metadata as any).readTime} min</span>
                  )}
                </div>
              </article>
            ))}
          </aside>
        </section>
      )}

      {/* ── Pull Quote Strip ── */}
      <section
        style={{
          background: 'var(--amber-pq)',
          padding: '3rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '780px',
            margin: '0 auto',
            borderLeft: '4px solid var(--amber)',
            paddingLeft: '1.5rem',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontStyle: 'italic',
              fontSize: '1.35rem',
              lineHeight: 1.65,
              color: 'var(--txt)',
              marginBottom: '0.75rem',
            }}
          >
            &ldquo;{pullQuote.text}&rdquo;
          </p>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              color: 'var(--txt-secondary)',
            }}
          >
            {pullQuote.attribution}
          </p>
        </div>
      </section>

      {/* ── Topic Filter Chips ── */}
      <nav
        style={{
          maxWidth: '1060px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {topics.map((t, i) => (
          <button
            key={t}
            type="button"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: i === 0 ? 'var(--amber)' : 'transparent',
              color: i === 0 ? 'var(--bg)' : 'var(--txt-secondary)',
              border:
                i === 0 ? '1px solid var(--amber)' : '1px solid var(--bdr)',
              borderRadius: '2px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* ── Essay Card Grid ── */}
      {essayGrid.length > 0 && (
        <section
          style={{
            maxWidth: '1060px',
            margin: '0 auto',
            padding: '1rem 1.5rem 5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}
        >
          {essayGrid.map((essay) => (
            <article
              key={essay.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                paddingBottom: '1.5rem',
                borderBottom: '0.5px solid var(--bdr)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--amber)',
                }}
              >
                {(essay.metadata as any)?.kicker ?? essay.tags?.[0] ?? 'Essay'}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  lineHeight: 1.3,
                  color: 'var(--txt)',
                }}
              >
                <a
                  href={`/ideas/${essay.slug}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {essay.title}
                </a>
              </h3>
              {essay.excerpt && (
                <p
                  style={{
                    fontFamily: 'var(--font-source-serif), serif',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    color: 'var(--txt-secondary)',
                  }}
                >
                  {essay.excerpt}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  color: 'var(--txt-secondary)',
                  marginTop: 'auto',
                }}
              >
                {essay.publishedAt && (
                  <time dateTime={essay.publishedAt.toISOString()}>
                    {essay.publishedAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                )}
                {(essay.metadata as any)?.readTime && (
                  <span>{(essay.metadata as any).readTime} min</span>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
