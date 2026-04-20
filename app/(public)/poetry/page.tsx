export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

const categories: string[] = [
  'All', 'Nature & place', 'Memory', 'Language & form', 'Grief', 'Politics',
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
    <div style={{ background: 'var(--bg)', color: 'var(--txt)',  }}>
      <SiteNav />

      {/* ── Hero ── */}
      <section style={{ padding: '4rem 2rem 3rem', borderBottom: '0.5px solid var(--bdr)' }}>
        <span style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--purple)', marginBottom: '1.5rem', display: 'block',
        }}>
          01 · The literary space
        </span>
        <h1 style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 'clamp(56px, 10vw, 120px)',
          fontWeight: 300, fontStyle: 'italic',
          lineHeight: 0.9, letterSpacing: '-0.03em',
          marginBottom: '1.5rem', color: 'var(--txt)',
        }}>
          Poetry
        </h1>
        <p style={{
          fontFamily: 'var(--font-source-serif), serif',
          fontSize: '18px', fontStyle: 'italic', fontWeight: 300,
          color: 'var(--txt2)', maxWidth: '44ch', lineHeight: 1.7,
        }}>
          Verse as a way of knowing. Language pressed into unfamiliar shapes to say what prose cannot.
        </p>
      </section>

      {/* ── Filter bar ── */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 2rem',
        borderBottom: '0.5px solid var(--bdr)', overflowX: 'auto',
      }}>
        {categories.map((cat, i) => (
          <button key={cat} style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '14px', fontStyle: 'italic', fontWeight: 300,
            color: i === 0 ? 'var(--purple)' : 'var(--txt3)',
            padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: i === 0 ? '1px solid var(--purple)' : '1px solid transparent',
            marginBottom: '-0.5px', whiteSpace: 'nowrap',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── Featured + grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {featured && (
          <div style={{
            gridColumn: '1 / -1', padding: '3rem 2rem',
            borderBottom: '0.5px solid var(--bdr)',
            display: 'grid', gridTemplateColumns: '1fr 1.1fr',
            gap: '3rem', alignItems: 'center',
            background: 'var(--bg2)',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--purple)', marginBottom: '1.25rem',
              }}>Featured poem</p>
              <h2 style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontStyle: 'italic', fontWeight: 300,
                lineHeight: 1.05, letterSpacing: '-0.02em',
                marginBottom: '1.25rem', color: 'var(--txt)',
              }}>{featured.title}</h2>
              {featured.excerpt && (
                <p style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontSize: '15px', fontStyle: 'italic', fontWeight: 300,
                  color: 'var(--txt2)', lineHeight: 1.8, marginBottom: '1.5rem',
                }}>{featured.excerpt}</p>
              )}
              <Link href={`/poetry/${featured.slug}`} style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--purple)', textDecoration: 'none',
              }}>Read poem →</Link>
            </div>
            <div style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(17px, 1.7vw, 20px)', fontStyle: 'italic', fontWeight: 300,
              lineHeight: 1.85, color: 'var(--txt)',
              borderLeft: '1px solid var(--purple)', paddingLeft: '1.75rem',
            }}
              dangerouslySetInnerHTML={{ __html: featured.content?.slice(0, 400) ?? '' }}
            />
          </div>
        )}

        {rest.map((poem, index) => (
          <Link key={poem.id} href={`/poetry/${poem.slug}`} className="hover-bg" style={{
            display: 'block', textDecoration: 'none', color: 'inherit',
            padding: '2.25rem 2rem',
            borderRight: index % 2 === 0 ? '0.5px solid var(--bdr)' : 'none',
            borderBottom: '0.5px solid var(--bdr)',
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px', letterSpacing: '0.2em',
              color: 'var(--purple)', marginBottom: '1.25rem',
            }}>
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(22px, 2.6vw, 28px)',
              fontStyle: 'italic', fontWeight: 300,
              lineHeight: 1.1, letterSpacing: '-0.015em',
              marginBottom: '1rem', color: 'var(--txt)',
            }}>{poem.title}</h3>
            {poem.excerpt && (
              <p style={{
                fontFamily: 'var(--font-source-serif), serif',
                fontSize: '14px', fontStyle: 'italic', fontWeight: 300,
                color: 'var(--txt2)', lineHeight: 1.75, marginBottom: '1.25rem',
              }}>{poem.excerpt}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {poem.publishedAt && (
                <time dateTime={poem.publishedAt.toISOString()} style={{
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--txt3)',
                }}>
                  {poem.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </time>
              )}
              {poem.tags?.[0] && (
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--purple)',
                }}>{poem.tags[0]}</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <SiteFooter section="01 / Poetry" />
    </div>
  )
}
