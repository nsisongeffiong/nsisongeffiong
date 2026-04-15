import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { CommentForm } from '@/components/comments/CommentForm'

export default async function TechPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1)

  if (!post) notFound()

  const metadata = post.metadata as any
  const readTime = metadata?.readTime

  return (
    <main>
      {/* ── Hero bar ── */}
      <header
        style={{
          background: 'var(--teal-hero)',
          padding: '3rem 1.5rem 2.5rem',
        }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    color: '#9FE1CB',
                    border: '1px solid #9FE1CB',
                    borderRadius: '2px',
                    padding: '0.1rem 0.4rem',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#9FE1CB',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}
          >
            {post.title}
          </h1>
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: '#9FE1CB',
              opacity: 0.8,
            }}
          >
            {post.publishedAt && (
              <time>{formatDate(post.publishedAt)}</time>
            )}
            {readTime && <span>{readTime}</span>}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div
        style={{
          maxWidth: '64rem',
          margin: '0 auto',
          padding: '3rem 1.5rem 2rem',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
        }}
      >
        <article
          className="tech-prose"
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '0.9rem',
            lineHeight: 1.75,
            color: 'var(--fg)',
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* ── Divider ── */}
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--bdr)',
          maxWidth: '64rem',
          margin: '0 auto',
        }}
      />

      {/* ── Comments ── */}
      <section
        style={{
          maxWidth: '64rem',
          margin: '0 auto',
          padding: '3rem 1.5rem 5rem',
        }}
      >
        <CommentForm postId={post.id} section="tech" />
      </section>
    </main>
  )
}
