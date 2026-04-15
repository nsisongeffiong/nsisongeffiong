import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { CommentForm } from '@/components/shared/CommentForm'
import { DisqusComments } from '@/components/shared/DisqusComments'

export default async function PoetryPost({
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
  const poetNote = metadata?.poetNote
  const legacyDisqus = metadata?.legacyDisqus === true

  return (
    <main>
      <article
        style={{
          maxWidth: '38rem',
          margin: '0 auto',
          padding: '5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        {/* ── Title ── */}
        <header style={{ marginBottom: '3rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--fg)',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            {post.title}
          </h1>
          {post.publishedAt && (
            <time
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.75rem',
                color: 'var(--fg2)',
              }}
            >
              {formatDate(post.publishedAt)}
            </time>
          )}
        </header>

        {/* ── Poem body ── */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '1.2rem',
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 1.9,
            color: 'var(--fg)',
            textAlign: 'center',
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ── Poet's note ── */}
        {poetNote && (
          <>
            <hr
              style={{
                border: 'none',
                borderTop: '0.5px solid var(--bdr)',
                margin: '3rem auto',
                maxWidth: '8rem',
              }}
            />
            <aside
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '0.95rem',
                fontStyle: 'italic',
                fontWeight: 300,
                color: 'var(--fg2)',
                lineHeight: 1.7,
                maxWidth: '30rem',
                margin: '0 auto',
              }}
            >
              <strong
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--fg2)',
                }}
              >
                Poet&rsquo;s note
              </strong>
              {poetNote}
            </aside>
          </>
        )}
      </article>

      {/* ── Divider ── */}
      <hr
        style={{
          border: 'none',
          borderTop: '0.5px solid var(--bdr)',
          maxWidth: '38rem',
          margin: '0 auto',
        }}
      />

      {/* ── Comments ── */}
      <section
        style={{
          maxWidth: '38rem',
          margin: '0 auto',
          padding: '3rem 1.5rem 5rem',
        }}
      >
        {legacyDisqus ? (
          <DisqusComments
            slug={post.slug}
            title={post.title}
            path={'/poetry/' + post.slug}
          />
        ) : (
          <CommentForm postId={post.id} section="poetry" />
        )}
      </section>
    </main>
  )
}
