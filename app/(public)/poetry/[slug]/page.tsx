import { SiteNav } from '@/components/shared/SiteNav'
import { DisqusComments } from '@/components/shared/DisqusComments'
import { CommentForm } from '@/components/shared/CommentForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { posts, comments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default async function PoetrySinglePage({
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

  const approvedComments = await db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, post.id), eq(comments.status, 'approved')))

  const meta     = post.metadata as any
  const category = meta?.category ?? post.tags?.[0] ?? 'Poetry'
  const poetNote = meta?.poetNote ?? null
  const isLegacy = meta?.legacyDisqus === true
  const author   = meta?.authorName ?? 'Nsisong Effiong'
  const date     = post.publishedAt
    ? post.publishedAt.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <>
      <SiteNav />

      <main
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          color: 'var(--txt)',
          background: 'var(--bg)',
          minHeight: '100vh',
        }}
      >
        {/* back link */}
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
          <Link
            href="/poetry"
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              color: 'var(--txt2)',
              textDecoration: 'none',
            }}
          >
            ← Poetry
          </Link>
        </div>

        {/* header */}
        <header
          style={{
            maxWidth: 580,
            margin: '0 auto',
            padding: '2.5rem 1.5rem 0',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '0.7rem',
              fontVariant: 'all-small-caps',
              letterSpacing: '0.14em',
              color: 'var(--purple-acc)',
              textTransform: 'uppercase',
            }}
          >
            {category}
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '3.375rem',
              lineHeight: 1.1,
              margin: '0.75rem 0 1rem',
              color: 'var(--txt)',
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: 'var(--txt2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{author}</span>
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--purple-acc)',
              }}
            />
            <span>{date}</span>
          </div>
        </header>

        <OrnamentalRule />

        {/* poem body */}
        <article
          style={{ maxWidth: 440, margin: '0 auto', padding: '0 1.5rem' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* end mark */}
        <div
          style={{
            textAlign: 'center',
            padding: '1rem 0 2.5rem',
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '1.25rem',
            color: 'var(--purple-acc)',
            letterSpacing: '0.3em',
          }}
        >
          · · ·
        </div>

        {/* poet's note */}
        {poetNote && (
          <section style={{ maxWidth: 440, margin: '0 auto', padding: '0 1.5rem 2.5rem' }}>
            <hr style={{ border: 'none', borderTop: '0.5px solid var(--bdr2)', margin: '0 0 1.25rem' }} />
            <span
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '0.65rem',
                fontVariant: 'all-small-caps',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--txt3)',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Poet&rsquo;s note
            </span>
            <p
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '0.95rem',
                lineHeight: 1.75,
                color: 'var(--txt2)',
                margin: 0,
              }}
            >
              {poetNote}
            </p>
          </section>
        )}

        {/* prev / next navigation */}
        <nav style={{ maxWidth: 580, margin: '0 auto', padding: '0 1.5rem 2.5rem' }}>
          <hr style={{ border: 'none', borderTop: '0.5px solid var(--bdr2)', margin: '0 0 1.5rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span />
            <Link
              href="/poetry"
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                color: 'var(--txt2)',
                textDecoration: 'none',
              }}
            >
              ← Back to Poetry
            </Link>
          </div>
        </nav>

        {/* comments section */}
        <section style={{ maxWidth: 580, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
          <OrnamentalRule />

          {/* count label */}
          {approvedComments.length > 0 && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '0.65rem',
                  fontVariant: 'all-small-caps',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--txt3)',
                }}
              >
                {approvedComments.length} {approvedComments.length === 1 ? 'response' : 'responses'}
              </span>
            </div>
          )}

          {/* comments list */}
          {approvedComments.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              {approvedComments.map((comment) => (
                <div key={comment.id} style={{ marginBottom: '1.75rem' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-cormorant), serif',
                        fontStyle: 'italic',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: 'var(--txt)',
                      }}
                    >
                      {comment.authorName}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-cormorant), serif',
                        fontStyle: 'italic',
                        fontSize: '0.8rem',
                        color: 'var(--txt3)',
                        marginLeft: '0.75rem',
                      }}
                    >
                      {comment.createdAt?.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-cormorant), serif',
                      fontStyle: 'italic',
                      fontWeight: 300,
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      color: 'var(--txt2)',
                      margin: '0.25rem 0 0',
                    }}
                  >
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {isLegacy ? (
            <DisqusComments
              slug={post.slug}
              title={post.title}
              path={`/poetry/${post.slug}`}
            />
          ) : (
            <CommentForm postId={post.id} section="poetry" />
          )}
        </section>
      </main>
    </>
  )
}

function OrnamentalRule() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        maxWidth: 580,
        margin: '2rem auto',
        padding: '0 1.5rem',
      }}
    >
      <span style={{ flex: 1, height: '0.5px', background: 'var(--bdr2)' }} />
      <span
        style={{
          display: 'inline-block',
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--purple-acc)',
        }}
      />
      <span style={{ flex: 1, height: '0.5px', background: 'var(--bdr2)' }} />
    </div>
  )
}
