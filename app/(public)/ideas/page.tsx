export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
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
        text: (leadEssay.metadata as any)?.pullQuote
          ?? (leadEssay.excerpt && leadEssay.excerpt.length < 140
              ? leadEssay.excerpt
              : 'The question is not whether AI will transform governance — it is who gets to define what transformation means, and for whom.'),
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
      <SiteNav />

      {/* ── Masthead ── */}
      <div style={{
        padding: '3.5rem 2rem 1.5rem',
        borderBottom: '2px solid var(--txt)',
        display: 'grid', gridTemplateColumns: '1fr auto',
        alignItems: 'end', gap: '2rem',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-inter-tight), var(--font-syne), sans-serif',
            fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--amber)', fontWeight: 600,
            display: 'block', marginBottom: '0.75rem',
          }}>Essays · Policy · Public Thought</span>
          <h1 style={{
            fontFamily: 'var(--font-inter-tight), var(--font-syne), sans-serif',
            fontSize: 'clamp(56px, 8vw, 104px)',
            fontWeight: 800, lineHeight: 0.92,
            letterSpacing: '-0.04em', color: 'var(--txt)',
          }}>Ideas</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: 'var(--font-source-serif), serif',
            fontSize: '14px', fontStyle: 'italic', fontWeight: 300,
            color: 'var(--txt2)', lineHeight: 1.7,
            maxWidth: '240px', marginBottom: '0.5rem',
          }}>
            Writing on governance, technology in society, and questions that deserve more friction.
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt3)',
          }}>{issueLabel}</p>
        </div>
      </div>

      {/* ── Lead + Sidebar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', borderBottom: '0.5px solid var(--bdr)' }}>
        <article style={{ padding: '2.5rem', borderRight: '0.5px solid var(--bdr)' }}>
          {leadEssay ? (
            <Link href={`/ideas/${leadEssay.slug}`} style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--amber)', fontWeight: 600,
                display: 'block', marginBottom: '1rem',
              }}>
                {(leadEssay.metadata as any)?.kicker ?? leadEssay.tags?.[0] ?? 'Technology & governance'}
              </span>
              <h2 style={{
                fontFamily: 'var(--font-inter-tight), var(--font-syne), sans-serif',
                fontSize: 'clamp(22px, 3vw, 34px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em',
                marginBottom: '1rem', color: 'var(--txt)', maxWidth: '22ch',
              }}>{leadEssay.title}</h2>
              {leadEssay.excerpt && (
                <p style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontSize: '15px', lineHeight: 1.7,
                  color: 'var(--txt2)', marginBottom: '1.25rem', fontWeight: 300,
                }}>{leadEssay.excerpt}</p>
              )}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {leadEssay.publishedAt && (
                  <span style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '11px', color: 'var(--txt3)', letterSpacing: '0.08em',
                  }}>
                    {leadEssay.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {(leadEssay.metadata as any)?.readTime ? ` · ${(leadEssay.metadata as any).readTime} min` : ''}
                  </span>
                )}
                <span style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '10px', color: 'var(--amber)',
                  letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
                }}>Read essay →</span>
              </div>
            </Link>
          ) : (
            <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '14px', color: 'var(--txt2)' }}>
              No essays published yet.
            </p>
          )}
        </article>

        <aside style={{ padding: '2rem 1.75rem' }}>
          <p style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--txt3)', fontWeight: 600,
            borderBottom: '0.5px solid var(--bdr)', paddingBottom: '0.75rem', marginBottom: '1rem',
          }}>Also this month</p>
          {sidebarEssays.map((essay, i) => (
            <Link key={essay.id} href={`/ideas/${essay.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '0.85rem 0',
                borderBottom: i < sidebarEssays.length - 1 ? '0.5px solid var(--bdr)' : 'none',
              }}>
                <p style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--amber)', fontWeight: 600, marginBottom: '0.4rem',
                }}>{(essay.metadata as any)?.kicker ?? essay.tags?.[0] ?? 'Essay'}</p>
                <p style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontSize: '13px', fontWeight: 300, lineHeight: 1.4, color: 'var(--txt)',
                }}>{essay.title}</p>
              </div>
            </Link>
          ))}
        </aside>
      </div>

      {/* ── Pullquote — Syne bold, not italic serif ── */}
      <div style={{
        padding: '2.5rem', borderBottom: '0.5px solid var(--bdr)',
        background: 'var(--bg2)',
      }}>
        <p style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: 'clamp(18px, 2.4vw, 26px)',
          fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em',
          color: 'var(--txt)', maxWidth: '48ch',
          borderLeft: '2px solid var(--amber)', paddingLeft: '1.5rem',
        }}>
          &ldquo;{pullQuote.text}&rdquo;
        </p>
        <p style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--amber-txt)', marginTop: '1rem', marginLeft: '1.5rem',
        }}>{pullQuote.attribution}</p>
      </div>

      {/* ── Topics filter ── */}
      <div style={{
        display: 'flex', gap: '0.4rem', padding: '1rem 2rem',
        flexWrap: 'wrap', alignItems: 'center',
        borderBottom: '0.5px solid var(--bdr)',
      }}>
        <span style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--txt3)', marginRight: '0.5rem',
        }}>Topics</span>
        {topics.map((t, i) => (
          <button key={t} style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px', padding: '4px 11px', borderRadius: '999px',
            border: '0.5px solid var(--bdr2)',
            color: i === 0 ? 'var(--bg)' : 'var(--txt2)',
            background: i === 0 ? 'var(--txt)' : 'transparent',
            cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {/* ── Card grid ── */}
      {cardEssays.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {cardEssays.map((essay, i) => (
            <Link key={essay.id} href={`/ideas/${essay.slug}`} style={{ textDecoration: 'none' }}>
              <article className="hover-bg" style={{
                padding: '2rem',
                borderRight: i % 3 < 2 ? '0.5px solid var(--bdr)' : 'none',
                borderBottom: '0.5px solid var(--bdr)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'var(--amber)', fontWeight: 600, marginBottom: '0.75rem',
                }}>{(essay.metadata as any)?.kicker ?? essay.tags?.[0] ?? 'Essay'}</p>
                <h3 style={{
                  fontFamily: 'var(--font-inter-tight), var(--font-syne), sans-serif',
                  fontSize: '17px', fontWeight: 700,
                  lineHeight: 1.25, letterSpacing: '-0.02em',
                  marginBottom: '0.75rem', color: 'var(--txt)', maxWidth: '22ch',
                }}>{essay.title}</h3>
                {essay.excerpt && (
                  <p style={{
                    fontFamily: 'var(--font-source-serif), serif',
                    fontSize: '13px', lineHeight: 1.7,
                    color: 'var(--txt2)', fontWeight: 300, marginBottom: '1rem',
                  }}>{essay.excerpt}</p>
                )}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px', color: 'var(--txt3)',
                }}>
                  {essay.publishedAt && (
                    <span>{essay.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  )}
                  {(essay.metadata as any)?.readTime && <span>{(essay.metadata as any).readTime} min</span>}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      <SiteFooter section="03 / Ideas" />
    </div>
  )
}
