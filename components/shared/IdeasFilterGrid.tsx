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

export type TopicFilter = { id: string; label: string; tags: string[] }

const ALL_TOPIC: TopicFilter = { id: 'all', label: 'All', tags: [] }

function essayMatchesTopic(essay: Essay, topic: TopicFilter): boolean {
  if (topic.id === 'all') return true
  const essayTags = (essay.tags ?? []).map(t => t.toLowerCase())
  return topic.tags.some(t => essayTags.includes(t))
}

export function IdeasFilterGrid({ essays, topics }: { essays: Essay[]; topics: TopicFilter[] }) {
  const [activeTopic, setActiveTopic] = useState<string>('all')

  const allTopics = [ALL_TOPIC, ...topics]
  const activeEntry = allTopics.find(t => t.id === activeTopic) ?? ALL_TOPIC

  // Only show topics that have at least one matching essay
  const visibleTopics = allTopics.filter(t =>
    t.id === 'all' || essays.some(e => essayMatchesTopic(e, t))
  )

  const filtered = essays.filter(e => essayMatchesTopic(e, activeEntry))

  return (
    <>
      {/* ── Topics filter ── */}
      <div style={{
        display: 'flex', gap: '0.4rem', padding: '1rem 2rem',
        alignItems: 'center', borderBottom: '0.5px solid var(--bdr)',
        overflowX: 'auto',
      }}>
        <span style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--txt3)', marginRight: '0.5rem', flexShrink: 0,
        }}>Topics</span>
        {visibleTopics.map((topic) => {
          const active = topic.id === activeTopic
          return (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id)}
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px', padding: '4px 11px', borderRadius: '999px',
                border: '0.5px solid var(--bdr2)',
                color: active ? 'var(--bg)' : 'var(--txt2)',
                background: active ? 'var(--txt)' : 'transparent',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'background 0.15s, color 0.15s',
              }}
            >{topic.label}</button>
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
          No essays under &ldquo;{activeEntry.label}&rdquo; yet.
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
