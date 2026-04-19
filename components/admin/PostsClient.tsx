'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const filters = ['All', 'Poetry', 'Tech', 'Ideas', 'Drafts'] as const
type Filter = (typeof filters)[number]

const typeBadgeStyles: Record<'poetry' | 'tech' | 'ideas', React.CSSProperties> = {
  poetry: { background: 'var(--purple-bg)', color: 'var(--purple-txt)' },
  tech:   { background: 'var(--teal-pale)', color: 'var(--teal-txt)' },
  ideas:  { background: 'var(--amber-bg)',  color: 'var(--amber-txt)' },
}

function fmtDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export interface Post {
  id: string
  title: string
  type: 'poetry' | 'tech' | 'ideas'
  published: boolean
  publishedAt: string | null
  excerpt: string | null
  slug: string | null
}

export default function PostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const router = useRouter()
  const [allPosts] = useState<Post[]>(initialPosts ?? [])
  const [activeFilter, setActiveFilter] = useState<Filter>('All')

  const displayed = allPosts.filter((p) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Drafts') return !p.published
    return p.type === activeFilter.toLowerCase()
  })

  return (
    <>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {filters.map((filter) => {
          const isActive = filter === activeFilter
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                background: 'none',
                border: `0.5px solid ${isActive ? 'var(--teal-mid)' : 'var(--bdr2)'}`,
                color: isActive ? 'var(--teal-mid)' : 'var(--txt2)',
                padding: '0.35rem 0.85rem',
                borderRadius: 3,
                cursor: 'pointer',
              }}
            >
              {filter}
            </button>
          )
        })}
      </div>

      {/* Posts table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              borderBottom: '0.5px solid var(--bdr)',
              textAlign: 'left',
            }}
          >
            <th style={{ paddingBottom: '0.6rem', fontWeight: 400 }}>Title</th>
            <th style={{ paddingBottom: '0.6rem', fontWeight: 400, width: 100 }}>Type</th>
            <th style={{ paddingBottom: '0.6rem', fontWeight: 400, width: 90 }}>Status</th>
            <th style={{ paddingBottom: '0.6rem', fontWeight: 400, width: 120 }}>Date</th>
            <th style={{ paddingBottom: '0.6rem', fontWeight: 400, width: 80 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((post) => (
            <tr
              key={post.id}
              onClick={() => router.push(`/admin/posts/${post.id}`)}
              style={{
                borderBottom: '0.5px solid var(--bdr)',
                cursor: 'pointer',
              }}
            >
              <td style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--txt)',
                  }}
                >
                  {post.title}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: 11,
                    color: 'var(--txt3)',
                    marginTop: 4,
                  }}
                >
                  {post.excerpt}
                </div>
              </td>

              <td style={{ paddingTop: '1rem', paddingBottom: '1rem', width: 100 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 2,
                    ...typeBadgeStyles[post.type],
                  }}
                >
                  {post.type}
                </span>
              </td>

              <td
                style={{
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  width: 90,
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: 10,
                  color: post.published ? 'var(--teal-mid)' : 'var(--txt3)',
                }}
              >
                {post.published ? 'Published' : 'Draft'}
              </td>

              <td
                style={{
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  width: 120,
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: 11,
                  color: 'var(--txt3)',
                }}
              >
                {fmtDate(post.publishedAt)}
              </td>

              <td
                style={{ paddingTop: '1rem', paddingBottom: '1rem', width: 80 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/admin/posts/${post.id}`}
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: 10,
                    color: 'var(--teal-mid)',
                    textDecoration: 'none',
                  }}
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
