'use client'

import Link from 'next/link'
import { useState } from 'react'

type Poem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  tags: string[] | null
  publishedAt: Date | null
  metadata: unknown
  content: string | null
}

export function PoetryPostList({ poems }: { poems: Poem[] }) {
  const [activeTag, setActiveTag] = useState<string>('All')

  // Derive unique tags from actual post data
  const allTags = ['All', ...Array.from(new Set(poems.flatMap((p) => p.tags ?? [])))]

  const filtered = activeTag === 'All'
    ? poems
    : poems.filter((p) => (p.tags ?? []).includes(activeTag))

  const featured = filtered[0]
  const rest     = filtered.slice(1)

  return (
    <>
      {/* ── Filter bar ── */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 2rem',
        borderBottom: '0.5px solid var(--bdr)', overflowX: 'auto',
      }}>
        {allTags.map((tag) => {
          const active = tag === activeTag
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '14px', fontStyle: 'italic', fontWeight: 300,
                color: active ? 'var(--purple)' : 'var(--txt3)',
                padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: active ? '1px solid var(--purple)' : '1px solid transparent',
                marginBottom: '-0.5px', whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
            >{tag}</button>
          )
        })}
      </div>

      {/* ── Featured + grid ── */}
      <div className="poetry-card-grid">
        {filtered.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1', padding: '4rem 2rem',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '12px', color: 'var(--txt3)',
          }}>
            No poems tagged &ldquo;{activeTag}&rdquo; yet.
          </div>
        ) : (
          <>
            {featured && (
              <div className="poetry-featured-grid" style={{
                gridColumn: '1 / -1', padding: '3rem 2rem',
                borderBottom: '0.5px solid var(--bdr)',
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
                <div
                  style={{
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
          </>
        )}
      </div>
    </>
  )
}
