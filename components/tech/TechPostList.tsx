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

export type TopicFilter = { id: string; label: string; tags: string[] }

const ALL_TOPIC: TopicFilter = { id: 'all', label: 'all', tags: [] }

function postMatchesTopic(post: TechPost, topic: TopicFilter): boolean {
  if (topic.id === 'all') return true
  const postTags = (post.tags ?? []).map(t => t.toLowerCase())
  return topic.tags.some(t => postTags.includes(t))
}

function tagStyle(tag: string): CSSProperties {
  const t = tag.toLowerCase()
  if (['devtools','python','bash','automation','aws','azure','gcp'].includes(t))
    return { background: 'var(--amber-bg)', color: 'var(--amber-txt)' }
  if (['systems','web','architecture','devops','linux','ubuntu','docker','kubernetes'].includes(t))
    return { background: 'var(--purple-bg)', color: 'var(--purple-txt)' }
  return { background: 'var(--teal-pale)', color: 'var(--teal-txt)' }
}

export function TechPostList({ posts, topics }: { posts: TechPost[]; topics: TopicFilter[] }) {
  const [sort, setSort]           = useState<'newest' | 'oldest'>('newest')
  const [activeTopic, setActiveTopic] = useState<string>('all')

  const allTopics = [ALL_TOPIC, ...topics]
  const activeEntry = allTopics.find(t => t.label === activeTopic) ?? ALL_TOPIC

  // Only show topics that have at least one matching post
  const visibleTopics = allTopics.filter(t =>
    t.id === 'all' || posts.some(p => postMatchesTopic(p, t))
  )

  const filtered = posts.filter(p => postMatchesTopic(p, activeEntry))

  const sorted = [...filtered].sort((a, b) => {
    const ta = a.publishedAt?.getTime() ?? 0
    const tb = b.publishedAt?.getTime() ?? 0
    return sort === 'newest' ? tb - ta : ta - tb
  })

  return (
    <>
      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', borderBottom: '0.5px solid var(--bdr)',
      }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', overflowX: 'auto' }}>
          {visibleTopics.map((topic) => {
            const active = topic.label === activeTopic
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.label)}
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px', padding: '4px 12px',
                  border: '0.5px solid var(--bdr2)', borderRadius: '999px',
                  color: active ? 'var(--bg)' : 'var(--txt2)',
                  background: active ? 'var(--txt)' : 'transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >{topic.label}</button>
            )
          })}
        </div>
        <button
          onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', color: 'var(--txt3)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, marginLeft: '1rem', flexShrink: 0,
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
          No articles under &ldquo;{activeTopic}&rdquo; yet.
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
        {(() => {
          const wordCounts = posts
            .map(p => (p.metadata as any)?.wordCount)
            .filter((n): n is number => typeof n === 'number' && n > 0)
          const avgWords = wordCounts.length
            ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
            : null
          const avgLabel = avgWords
            ? avgWords >= 1000 ? `~${(avgWords / 1000).toFixed(1)}k` : String(avgWords)
            : '—'

          return [
            { n: String(posts.length), label: 'articles published' },
            { n: avgLabel,             label: 'avg words / article' },
            { n: String(topics.length), label: 'topics covered' },
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
          ))
        })()}
      </div>
    </>
  )
}
