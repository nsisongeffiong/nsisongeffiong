'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CSSProperties } from 'react'

interface PostMeta { readTime?: number }

type TechPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  tags: string[] | null
  publishedAt: Date | null
  metadata: unknown
}

function tagStyle(tag: string): CSSProperties {
  const t = tag.toLowerCase()
  if (t === 'devtools' || t === 'python' || t === 'performance')
    return { background: 'var(--amber-bg)', color: 'var(--amber-txt)' }
  if (t === 'systems' || t === 'web' || t === 'architecture')
    return { background: 'var(--purple-bg)', color: 'var(--purple-txt)' }
  return { background: 'var(--teal-pale)', color: 'var(--teal-txt)' }
}

export function TechPostList({ posts }: { posts: TechPost[] }) {
  const [sort, setSort]           = useState<'newest' | 'oldest'>('newest')
  const [activeTag, setActiveTag] = useState<string>('all')

  // Derive unique tags from actual post data
  const allTags = ['all', ...Array.from(new Set(posts.flatMap((a) => a.tags ?? [])))]

  const filtered = activeTag === 'all'
    ? posts
    : posts.filter((a) => (a.tags ?? []).includes(activeTag))

  const sorted = [...filtered].sort((a, b) => {
    const ta = a.publishedAt?.getTime() ?? 0
    const tb = b.publishedAt?.getTime() ?? 0
    return sort === 'newest' ? tb - ta : ta - tb
  })

  const uniqueTopics = new Set(posts.flatMap((a) => a.tags ?? []))

  return (
    <>
      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', borderBottom: '0.5px solid var(--bdr)',
      }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {allTags.map((tag) => {
            const active = tag === activeTag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px', padding: '4px 12px',
                  border: '0.5px solid var(--bdr2)', borderRadius: '999px',
                  color: active ? 'var(--bg)' : 'var(--txt2)',
                  background: active ? 'var(--txt)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >{tag}</button>
            )
          })}
        </div>
        <button
          onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', color: 'var(--txt3)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          sort <span style={{ color: 'var(--txt2)' }}>{sort === 'newest' ? '↓ newest' : '↑ oldest'}</span>
        </button>
      </div>

      {/* ── Post list ── */}
      {sorted.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '12px', color: 'var(--txt3)',
        }}>
          No articles tagged &ldquo;{activeTag}&rdquo; yet.
        </div>
      ) : sorted.map((a, i) => (
        <Link key={a.id} href={`/tech/${a.slug}`} className="hover-bg" style={{
          display: 'grid', gridTemplateColumns: '3rem 1fr auto',
          gap: '2rem', padding: '1.75rem 2rem',
          borderBottom: '0.5px solid var(--bdr)',
          alignItems: 'start', textDecoration: 'none', color: 'inherit',
        }}>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', color: 'var(--txt3)', paddingTop: '0.5rem',
          }}>{String(i + 1).padStart(2, '0')}</span>

          <div>
            {(a.tags ?? []).length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                {(a.tags ?? []).map((tag) => (
                  <span key={tag} style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                    border: '0.5px solid var(--bdr2)',
                    ...tagStyle(tag),
                  }}>{tag}</span>
                ))}
              </div>
            )}
            <h3 style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '17px', fontWeight: 600, lineHeight: 1.3,
              marginBottom: '0.5rem', letterSpacing: '-0.015em', color: 'var(--txt)',
            }}>{a.title}</h3>
            {a.excerpt && (
              <p style={{
                fontFamily: 'var(--font-source-serif), serif',
                fontSize: '14px', color: 'var(--txt2)',
                lineHeight: 1.65, fontWeight: 300, maxWidth: '60ch',
              }}>{a.excerpt}</p>
            )}
          </div>

          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', color: 'var(--txt3)',
            whiteSpace: 'nowrap', paddingTop: '0.5rem', textAlign: 'right',
          }}>
            {a.publishedAt
              ? a.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : ''}
            {(a.metadata as PostMeta)?.readTime ? ` · ${(a.metadata as PostMeta).readTime} min` : ''}
          </span>
        </Link>
      ))}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { n: String(posts.length),           label: 'articles published' },
          { n: '~7k',                          label: 'avg words / article' },
          { n: String(uniqueTopics.size || 4), label: 'topics covered' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            padding: '1.75rem 2rem',
            borderRight: i < arr.length - 1 ? '0.5px solid var(--bdr)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '40px', fontWeight: 300,
              color: 'var(--teal-mid)', lineHeight: 1, marginBottom: '0.35rem',
            }}>{s.n}</div>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--txt3)',
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </>
  )
}
