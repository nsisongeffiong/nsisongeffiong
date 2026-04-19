'use client'

import { useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'

type CommentStatus = 'pending' | 'approved' | 'rejected'

export interface CommentRow {
  id: string
  postTitle: string
  postType: 'poetry' | 'tech' | 'ideas'
  authorName: string
  authorEmail: string
  body: string
  status: CommentStatus
  createdAt: Date
}

const typeBadgeStyles: Record<'poetry' | 'tech' | 'ideas', React.CSSProperties> = {
  poetry: { background: 'var(--purple-bg)', color: 'var(--purple-txt)' },
  tech:   { background: 'var(--teal-pale)',  color: 'var(--teal-txt)' },
  ideas:  { background: 'var(--amber-bg)',   color: 'var(--amber-txt)' },
}

const tabs = ['All', 'Pending', 'Approved'] as const
type Tab = typeof tabs[number]

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CommentsClient({ initialComments }: { initialComments: CommentRow[] }) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('Pending')

  async function patchStatus(id: string, status: CommentStatus) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) return
      const { data } = await res.json()
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: data.status } : c))
      )
    } finally {
      setLoadingId(null)
    }
  }

  async function handleReject(id: string) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      if (!res.ok) return
      setComments((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setLoadingId(null)
    }
  }

  const filtered = comments.filter((c) => {
    if (activeTab === 'All') return true
    if (activeTab === 'Pending') return c.status === 'pending'
    if (activeTab === 'Approved') return c.status === 'approved'
    return true
  })

  const pendingCount = comments.filter((c) => c.status === 'pending').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <main style={{ marginLeft: 220, flex: 1, padding: '2.5rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--txt)',
              margin: 0,
            }}
          >
            Comments
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 11,
              background: 'var(--amber-bg)',
              color: 'var(--amber-txt)',
              padding: '0.35rem 0.85rem',
              borderRadius: 3,
            }}
          >
            {pendingCount} pending
          </span>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '0.5px solid var(--bdr)' }}>
          {tabs.map((tab) => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  padding: '0.6rem 1.25rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'var(--teal-mid)' : 'var(--txt3)',
                  borderBottom: isActive ? '2px solid var(--teal-mid)' : '2px solid transparent',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Comment cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((comment) => {
            const busy = loadingId === comment.id
            return (
              <div
                key={comment.id}
                style={{
                  background: 'var(--bg2)',
                  border: '0.5px solid var(--bdr)',
                  borderRadius: 4,
                  padding: '1.25rem',
                  opacity: busy ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {/* Card top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>
                      {comment.authorName}
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--txt3)' }}>
                      {comment.authorEmail}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--txt3)' }}>
                    {fmtDate(comment.createdAt)}
                  </div>
                </div>

                {/* Post reference */}
                <div
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    color: 'var(--txt3)',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ padding: '2px 8px', borderRadius: 2, ...typeBadgeStyles[comment.postType] }}>
                    {comment.postType}
                  </span>
                  {truncate(comment.postTitle, 50)}
                </div>

                {/* Comment body */}
                <div
                  style={{
                    fontFamily: 'var(--font-source-serif), serif',
                    fontSize: 14,
                    fontWeight: 300,
                    color: 'var(--txt2)',
                    lineHeight: 1.7,
                    marginBottom: '1rem',
                  }}
                >
                  {comment.body}
                </div>

                {/* Action row */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {comment.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patchStatus(comment.id, 'approved')}
                        style={{
                          fontFamily: 'var(--font-dm-mono)',
                          fontSize: 10,
                          textTransform: 'uppercase',
                          background: 'var(--teal-hero)',
                          color: 'var(--teal-light)',
                          border: 'none',
                          padding: '0.4rem 0.85rem',
                          borderRadius: 3,
                          cursor: busy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleReject(comment.id)}
                        style={{
                          fontFamily: 'var(--font-dm-mono)',
                          fontSize: 10,
                          textTransform: 'uppercase',
                          background: 'none',
                          border: '0.5px solid var(--bdr2)',
                          color: 'var(--txt3)',
                          padding: '0.4rem 0.85rem',
                          borderRadius: 3,
                          cursor: busy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, color: 'var(--teal-mid)' }}>
                        Approved
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patchStatus(comment.id, 'pending')}
                        style={{
                          fontFamily: 'var(--font-dm-mono)',
                          fontSize: 10,
                          background: 'none',
                          border: 'none',
                          color: 'var(--txt3)',
                          cursor: busy ? 'not-allowed' : 'pointer',
                          padding: 0,
                        }}
                      >
                        Undo
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
