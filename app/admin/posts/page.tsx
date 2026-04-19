import AdminNav from '@/components/admin/AdminNav'
import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const filters = ['All', 'Poetry', 'Tech', 'Ideas', 'Drafts'] as const

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

function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminPostsPage() {
  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      type: posts.type,
      published: posts.published,
      publishedAt: posts.publishedAt,
      excerpt: posts.excerpt,
      slug: posts.slug,
    })
    .from(posts)
    .orderBy(desc(posts.publishedAt))

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
            Posts
          </h1>
          <Link
            href="/admin/posts/new"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              background: 'var(--teal-hero)',
              color: 'var(--teal-light)',
              padding: '0.55rem 1.1rem',
              borderRadius: 3,
              textDecoration: 'none',
            }}
          >
            New post
          </Link>
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                background: 'none',
                border: `0.5px solid ${filter === 'All' ? 'var(--teal-mid)' : 'var(--bdr2)'}`,
                color: filter === 'All' ? 'var(--teal-mid)' : 'var(--txt2)',
                padding: '0.35rem 0.85rem',
                borderRadius: 3,
                cursor: 'pointer',
              }}
            >
              {filter}
            </button>
          ))}
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
            {allPosts.map((post) => (
              <tr
                key={post.id}
                style={{
                  borderBottom: '0.5px solid var(--bdr)',
                }}
              >
                {/* Title cell */}
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

                {/* Type cell */}
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

                {/* Status cell */}
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

                {/* Date cell */}
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

                {/* Actions cell */}
                <td style={{ paddingTop: '1rem', paddingBottom: '1rem', width: 80 }}>
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
      </main>
    </div>
  )
}
