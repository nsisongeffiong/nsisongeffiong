import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { CommentForm } from '@/components/comments/CommentForm'

export default async function IdeasPost({
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
  const kicker = metadata?.kicker
  const volume = metadata?.volume

  return (
    <main>
      {/* ── Header ── */}
      <header
        style={{
          maxWidth: '42rem',
          margin: '0 auto',
          padding: '5rem 1.5rem 2rem',
        }}
      >
        {kicker && (
          <span
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--amber)',
              display: 'block',
              marginBottom: '0.75rem',
            }}
          >
            {kicker}
          </span>
        )}
        <h1
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: 'var(--fg)',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}
        >
          {post.title}
        </h1>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '0.75rem',
            color: 'var(--fg2)',
          }}
        >
          {post.publishedAt && (
            <time>{formatDate(post.publishedAt)}</time>
          )}
          {volume && <span>{volume}</span>}
        </div>
      </header>

      {/* ── Divider ── */}
      <hr
        style={{
          border: 'none',
          borderTop: '0.5px solid var(--bdr)',
          maxWidth: '42rem',
          margin: '0 auto 2.5rem',
        }}
      />

      {/* ── Body ── */}
      <article
        className="ideas-prose"
        style={{
          maxWidth: '42rem',
          margin: '0 auto',
          padding: '0 1.5rem 3rem',
          fontFamily: 'var(--font-source-serif), serif',
          fontSize: '1.05rem',
          lineHeight: 1.8,
          color: 'var(--fg)',
        }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* ── Divider ── */}
      <hr
        style={{
          border: 'none',
          borderTop: '0.5px solid var(--bdr)',
          maxWidth: '42rem',
          margin: '0 auto',
        }}
      />

      {/* ── Comments ── */}
      <section
        style={{
          maxWidth: '42rem',
          margin: '0 auto',
          padding: '3rem 1.5rem 5rem',
        }}
      >
        {volume && (
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              color: 'var(--fg2)',
              marginBottom: '1.5rem',
            }}
          >
            0 responses · {volume}
          </p>
        )}
        <CommentForm postId={post.id} section="ideas" />
      </section>
    </main>
  )
}
