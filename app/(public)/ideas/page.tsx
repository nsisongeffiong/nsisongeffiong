export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

const topics = ['All', 'AI & society', 'Public policy', 'Political economy', 'Digital rights', 'Media']

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

  const leadEssay     = essays[0]
  const sidebarEssays = essays.slice(1, 4)
  const cardEssays    = essays.slice(4)

  const pullQuote = leadEssay
    ? {
        text: leadEssay.excerpt ?? 'The question is not whether AI will transform governance — it is who gets to define what transformation means, and for whom.',
        attribution: `— from "${leadEssay.title}"`,
      }
    : {
        text: 'The question is not whether AI will transform governance — it is who gets to define what transformation means, and for whom.',
        attribution: '— Nsisong Effiong',
      }

  const issueLabel = leadEssay
    ? `Vol. I · ${leadEssay.publishedAt?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) ?? 'April 2026'}`
    : 'Vol. I · April 2026'

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)', minHeight: '100vh' }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          borderBottom: '0.5px solid rgba(28,28,24,0.1)',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '13px',
            color: '#5C5B54',
            textDecoration: 'none',
          }}
        >
          ← nsisongeffiong.com
        </Link>
        <span
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#BA7517',
            fontWeight: 600,
          }}
        >
          Ideas &amp; Policy
        </span>
      </nav>

      {/* ── Masthead ─────────────────────────────────────── */}
      <div
        style={{
          padding: '2.75rem 2rem 1.1rem',
          borderBottom: '3px solid #1C1C18',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'end',
          gap: '2rem',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#BA7517',
              fontWeight: 600,
              display: 'block',
              marginBottom: '0.75rem',
            }}
          >
            Essays · Policy · Public Thought
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 'clamp(44px, 7.5vw, 80px)',
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: '#1C1C18',
            }}
          >
            Ideas
          </h1>
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontSize: '14px',
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#5C5B54',
              lineHeight: 1.7,
              maxWidth: '240px',
              textAlign: 'right',
            }}
          >
            Writing on governance, technology in society, and questions that deserve more friction.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9C9B90',
              marginTop: '0.6rem',
              textAlign: 'right',
            }}
          >
            {issueLabel}
          </p>
        </div>
      </div>

      {/* ── Top Grid: Lead + Sidebar ─────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          borderBottom: '0.5px solid rgba(28,28,24,0.1)',
        }}
      >
        {/* Lead essay */}
        <article
          style={{
            padding: '2rem',
            borderRight: '0.5px solid rgba(28,28,24,0.1)',
            cursor: 'pointer',
          }}
        >
          {leadEssay ? (
            <Link href={`/ideas/${leadEssay.slug}`} style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '9px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#BA7517',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  display: 'block',
                }}
              >
                {(leadEssay.metadata as any)?.kicker ?? leadEssay.tags?.[0] ?? 'Technology & governance'}
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: 'clamp(18px, 3vw, 28px)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  marginBottom: '0.75rem',
                  color: '#1C1C18',
                }}
              >
                {leadEssay.title}
              </h2>
              {leadEssay.excerpt && (
                <p
                  style={{
                    fontFamily: 'var(--font-source-serif), serif',
                    fontSize: '13px',
                    lineHeight: 1.8,
                    color: '#5C5B54',
                    marginBottom: '1.1rem',
                    fontWeight: 300,
                  }}
                >
                  {leadEssay.excerpt}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                {leadEssay.publishedAt && (
                  <span
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontSize: '10px',
                      color: '#9C9B90',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {leadEssay.publishedAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {(leadEssay.metadata as any)?.readTime
                      ? ` · ${(leadEssay.metadata as any).readTime} min`
                      : ''}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontSize: '10px',
                    color: '#BA7517',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Read essay →
                </span>
              </div>
            </Link>
          ) : (
            <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '13px', color: '#5C5B54' }}>
              No essays published yet.
            </p>
          )}
        </article>

        {/* Sidebar */}
        <aside style={{ padding: '1.6rem 1.4rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#9C9B90',
              borderBottom: '0.5px solid rgba(28,28,24,0.1)',
              paddingBottom: '0.6rem',
              marginBottom: '0.85rem',
            }}
          >
            Also this month
          </p>
          {sidebarEssays.map((essay, i) => (
            <Link
              key={essay.id}
              href={`/ideas/${essay.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  padding: '0.75rem 0',
                  borderBottom:
                    i < sidebarEssays.length - 1
                      ? '0.5px solid rgba(28,28,24,0.1)'
                      : 'none',
                  cursor: 'pointer',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#BA7517',
                    fontWeight: 600,
                    marginBottom: '0.3rem',
                  }}
                >
                  {(essay.metadata as any)?.kicker ?? essay.tags?.[0] ?? 'Essay'}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-source-serif), serif',
                    fontSize: '12px',
                    fontWeight: 300,
                    lineHeight: 1.4,
                    color: '#1C1C18',
                  }}
                >
                  {essay.title}
                </p>
              </div>
            </Link>
          ))}
        </aside>
      </div>

      {/* ── Pull Quote ───────────────────────────────────── */}
      <div
        style={{
          background: '#FDF0D4',
          padding: '1.75rem 2rem',
          borderBottom: '0.5px solid rgba(28,28,24,0.1)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-source-serif), serif',
            fontSize: 'clamp(15px, 2.2vw, 21px)',
            fontStyle: 'italic',
            fontWeight: 300,
            color: '#5C3608',
            maxWidth: '680px',
            borderLeft: '3px solid #BA7517',
            paddingLeft: '1.4rem',
            lineHeight: 1.55,
          }}
        >
          &ldquo;{pullQuote.text}&rdquo;
        </p>
        <p
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#9A5C10',
            marginTop: '0.75rem',
            marginLeft: '1.4rem',
          }}
        >
          {pullQuote.attribution}
        </p>
      </div>

      {/* ── Topics Filter ────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '1rem 2rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          borderBottom: '0.5px solid rgba(28,28,24,0.1)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#9C9B90',
            marginRight: '0.4rem',
          }}
        >
          Topics
        </span>
        {topics.map((t, i) => (
          <span
            key={t}
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '10px',
              padding: '4px 11px',
              border: i === 0 ? '0.5px solid #BA7517' : '0.5px solid rgba(28,28,24,0.2)',
              borderRadius: '2px',
              color: i === 0 ? '#7A4A0A' : '#5C5B54',
              background: i === 0 ? '#FDF6E8' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* ── Card Grid ────────────────────────────────────── */}
      {cardEssays.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
        >
          {cardEssays.map((essay, i) => (
            <Link
              key={essay.id}
              href={`/ideas/${essay.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <article
                style={{
                  padding: '1.6rem 2rem',
                  borderRight:
                    i < cardEssays.length - 1
                      ? '0.5px solid rgba(28,28,24,0.1)'
                      : 'none',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#BA7517',
                    fontWeight: 600,
                    marginBottom: '0.6rem',
                  }}
                >
                  {(essay.metadata as any)?.kicker ?? essay.tags?.[0] ?? 'Essay'}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    lineHeight: 1.25,
                    letterSpacing: '-0.02em',
                    marginBottom: '0.6rem',
                    color: '#1C1C18',
                  }}
                >
                  {essay.title}
                </h3>
                {essay.excerpt && (
                  <p
                    style={{
                      fontFamily: 'var(--font-source-serif), serif',
                      fontSize: '12px',
                      lineHeight: 1.7,
                      color: '#5C5B54',
                      fontWeight: 300,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {essay.excerpt}
                  </p>
                )}
                <div
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontSize: '10px',
                    color: '#9C9B90',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  {essay.publishedAt && (
                    <span>
                      {essay.publishedAt.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                  {(essay.metadata as any)?.readTime && (
                    <span>{(essay.metadata as any).readTime} min</span>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
