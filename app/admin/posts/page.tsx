import AdminNav from '@/components/admin/AdminNav'
import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import PostsClient from '@/components/admin/PostsClient'

export const dynamic = 'force-dynamic'

export default async function AdminPostsPage() {
  const rows = await db
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

  const allPosts = rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
  }))

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

        <PostsClient initialPosts={allPosts} />
      </main>
    </div>
  )
}
