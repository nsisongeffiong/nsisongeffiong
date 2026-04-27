'use client'

import Link from 'next/link'
import { useState } from 'react'
import { IdeaMasonryGrid } from '@/components/shared/IdeaMasonryGrid'

type Essay = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  tags: string[] | null
  publishedAt: Date | null
  metadata: unknown
}

export function IdeasFilterGrid({ essays }: { essays: Essay[] }) {
  const [activeTag, setActiveTag] = useState<string>('All')

  // Derive unique tags from actual post data
  const allTags = ['All', ...Array.from(new Set(essays.flatMap((e) => e.tags ?? [])))]

  const filtered = activeTag === 'All'
    ? essays
    : essays.filter((e) => (e.tags ?? []).includes(activeTag))

  return (
    <>
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
        {allTags.map((tag) => {
          const active = tag === activeTag
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px', padding: '4px 11px', borderRadius: '999px',
                border: '0.5px solid var(--bdr2)',
                color: active ? 'var(--bg)' : 'var(--txt2)',
                background: active ? 'var(--txt)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
              }}
            >{tag}</button>
          )
        })}
      </div>

      {/* ── Card grid ── */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '12px', color: 'var(--txt3)',
        }}>
          No essays tagged &ldquo;{activeTag}&rdquo; yet.
        </div>
      ) : (
        <IdeaMasonryGrid>
          {filtered.map((essay) => (
            <Link key={essay.id} href={`/ideas/${essay.slug}`} style={{ textDecoration: 'none' }}>
              <article data-masonry-card className="hover-bg" style={{
                display: 'inline-block', width: '100%', breakInside: 'avoid',
                boxSizing: 'border-box', padding: '2rem',
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
        </IdeaMasonryGrid>
      )}
    </>
  )
}
