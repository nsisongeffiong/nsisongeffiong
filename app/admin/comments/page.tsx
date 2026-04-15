import AdminNav from '@/components/admin/AdminNav'

const comments: {
  id: string
  postTitle: string
  postType: 'poetry' | 'tech' | 'ideas'
  authorName: string
  authorEmail: string
  body: string
  status: 'pending' | 'approved'
  createdAt: string
}[] = [
  { id: '1', postTitle: 'What the delta teaches about forgetting', postType: 'poetry', authorName: 'Chidinma Osei', authorEmail: 'c.osei@example.com', body: 'This is how grief actually moves. Not dramatically. Just quietly outward.', status: 'pending', createdAt: 'Apr 12, 2026' },
  { id: '2', postTitle: 'orchestrate.py — a deep dive', postType: 'tech', authorName: 'Tunde Nwachukwu', authorEmail: 't.nwachukwu@example.com', body: 'The git-commit-per-stage approach is clever. Have you thought about using git tags?', status: 'pending', createdAt: 'Apr 8, 2026' },
  { id: '3', postTitle: 'Why public sector AI adoption keeps failing', postType: 'ideas', authorName: 'Funke Adeleke', authorEmail: 'f.adeleke@example.com', body: 'The point about vendor-defined success metrics is the crux of it.', status: 'approved', createdAt: 'Apr 4, 2026' },
  { id: '4', postTitle: 'What the delta teaches about forgetting', postType: 'poetry', authorName: 'Emeka Balogun', authorEmail: 'e.balogun@example.com', body: 'The indentation in the fourth stanza does so much work.', status: 'pending', createdAt: 'Apr 14, 2026' },
]

const tabs = ['All', 'Pending', 'Approved'] as const

const typeBadgeStyles: Record<'poetry' | 'tech' | 'ideas', React.CSSProperties> = {
  poetry: {
    background: 'var(--purple-bg)',
    color: 'var(--purple-txt)',
  },
  tech: {
    background: 'var(--teal-pale)',
    color: 'var(--teal-txt)',
  },
  ideas: {
    background: 'var(--amber-bg)',
    color: 'var(--amber-txt)',
  },
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

export default function AdminCommentsPage() {
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
            const isActive = tab === 'Pending'
            return (
              <button
                key={tab}
                type="button"
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
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: 'var(--bg2)',
                border: '0.5px solid var(--bdr)',
                borderRadius: 4,
                padding: '1.25rem',
              }}
            >
              {/* Card top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-syne)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--txt)',
                    }}
                  >
                    {comment.authorName}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-dm-mono)',
                      fontSize: 11,
                      color: 'var(--txt3)',
                    }}
                  >
                    {comment.authorEmail}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: 11,
                    color: 'var(--txt3)',
                  }}
                >
                  {comment.createdAt}
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
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 2,
                    ...typeBadgeStyles[comment.postType],
                  }}
                >
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
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {comment.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        background: 'var(--teal-hero)',
                        color: 'var(--teal-light)',
                        border: 'none',
                        padding: '0.4rem 0.85rem',
                        borderRadius: 3,
                        cursor: 'pointer',
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        background: 'none',
                        border: '0.5px solid var(--bdr2)',
                        color: 'var(--txt3)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: 3,
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: 10,
                        color: 'var(--teal-mid)',
                      }}
                    >
                      Approved
                    </span>
                    <button
                      type="button"
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: 10,
                        background: 'none',
                        border: 'none',
                        color: 'var(--txt3)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Undo
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
