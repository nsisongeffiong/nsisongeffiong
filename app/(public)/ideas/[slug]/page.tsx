import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { CommentForm } from '@/components/shared/CommentForm'
import { DisqusComments } from '@/components/shared/DisqusComments'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { posts, comments } from '@/lib/db/schema'
import { eq, and, lt, gt, desc, asc } from 'drizzle-orm'

export default async function IdeasSinglePage({
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

  const [prevPost] = await db
    .select({ title: posts.title, slug: posts.slug })
    .from(posts)
    .where(and(eq(posts.type, 'ideas'), eq(posts.published, true), lt(posts.publishedAt, post.publishedAt!)))
    .orderBy(desc(posts.publishedAt))
    .limit(1)

  const [nextPost] = await db
    .select({ title: posts.title, slug: posts.slug })
    .from(posts)
    .where(and(eq(posts.type, 'ideas'), eq(posts.published, true), gt(posts.publishedAt, post.publishedAt!)))
    .orderBy(asc(posts.publishedAt))
    .limit(1)

  const approvedComments = await db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, post.id), eq(comments.status, 'approved')))

  const meta     = post.metadata as any
  const kicker   = meta?.kicker ?? post.tags?.[0] ?? 'Essay'
  const volume   = meta?.volume ?? 'Vol. I'
  const readTime = meta?.readTime ?? null
  const deck     = meta?.deck ?? post.excerpt ?? null
  const isLegacy = meta?.legacyDisqus === true
  const date     = post.publishedAt
    ? post.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <>
      <SiteNav />

      <main style={{ background: 'var(--bg)', color: 'var(--txt)' }}>

        {/* ── Sub-nav ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '0.5px solid var(--bdr)',
        }}>
          <Link href="/ideas" style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '13px', fontWeight: 500,
            color: 'var(--txt2)', textDecoration: 'none',
          }}>← Ideas &amp; Policy</Link>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--amber)',
          }}>Essay · {volume}</span>
        </div>

        {/* ── Header ── */}
        <header style={{
          padding: '4rem 2rem 2.5rem',
          borderBottom: '2px solid var(--txt)',
        }}>
          <span style={{
            fontFamily: 'var(--font-inter-tight), var(--font-syne), sans-serif',
            fontSize: '11px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.22em',
            color: 'var(--amber)', display: 'block', marginBottom: '1rem',
          }}>{kicker}</span>

          <h1 style={{
            fontFamily: 'var(--font-inter-tight), var(--font-syne), sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 52px)',
            lineHeight: 1.06, letterSpacing: '-0.03em',
            color: 'var(--txt)',
            marginBottom: '1.25rem',
            maxWidth: '28ch',
          }}>{post.title}</h1>

          {deck && (
            <p style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontStyle: 'italic', fontWeight: 300,
              fontSize: '18px', lineHeight: 1.6,
              color: 'var(--txt2)',
              marginBottom: '1.5rem', maxWidth: '56ch',
            }}>{deck}</p>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '12px', color: 'var(--txt3)',
          }}>
            <span style={{ color: 'var(--txt)', fontWeight: 500 }}>Nsisong Effiong</span>
            <span style={{ width: 1, height: 12, background: 'var(--bdr2)', display: 'inline-block' }} />
            <span>{date}</span>
            {readTime && <>
              <span style={{ width: 1, height: 12, background: 'var(--bdr2)', display: 'inline-block' }} />
              <span>{readTime} min read</span>
            </>}
          </div>
        </header>

        {/* ── Body ── */}
        <article
          className="ideas-body"
          style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 2rem' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ── Prev / Next ── */}
        <div style={{ borderTop: '2px solid var(--txt)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '1.75rem 2rem' }}>
            {prevPost && (
              <Link href={`/ideas/${prevPost.slug}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.16em',
                  color: 'var(--txt3)', display: 'block', marginBottom: '0.5rem',
                }}>← Previous</span>
                <span style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontStyle: 'italic', fontWeight: 300,
                  fontSize: '15px', lineHeight: 1.4, color: 'var(--txt)',
                }}>{prevPost.title}</span>
              </Link>
            )}
          </div>
          <div style={{ padding: '1.75rem 2rem', borderLeft: '0.5px solid var(--bdr)', textAlign: 'right' }}>
            {nextPost && (
              <Link href={`/ideas/${nextPost.slug}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.16em',
                  color: 'var(--txt3)', display: 'block', marginBottom: '0.5rem',
                }}>Next →</span>
                <span style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontStyle: 'italic', fontWeight: 300,
                  fontSize: '15px', lineHeight: 1.4, color: 'var(--txt)',
                }}>{nextPost.title}</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Comments ── */}
        <section style={{
          borderTop: '2px solid var(--txt)',
          padding: '3rem 2rem 4rem',
          maxWidth: 700, margin: '0 auto',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: '2.25rem',
          }}>
            <span style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt)',
            }}>Responses</span>
            <span style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '12px', color: 'var(--amber)', fontWeight: 600,
            }}>{approvedComments.length} responses · {volume}</span>
          </div>

          {approvedComments.map((comment) => (
            <div key={comment.id} style={{ padding: '1.5rem 0', borderBottom: '0.5px solid var(--bdr)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
                <span style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '14px', fontWeight: 700,
                  letterSpacing: '-0.01em', color: 'var(--txt)',
                }}>{comment.authorName}</span>
                <span style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '10px', color: 'var(--txt3)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {comment.createdAt?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-source-serif), serif',
                fontWeight: 300, fontSize: '15px',
                lineHeight: 1.8, color: 'var(--txt2)',
                marginBottom: '0.75rem',
              }}>{comment.body}</p>
              <span style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--amber)', cursor: 'pointer',
              }}>Reply →</span>
            </div>
          ))}

          {/* Form */}
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '0.5px solid var(--bdr)' }}>
            <div style={{ width: 40, height: 2, background: 'var(--amber)', marginBottom: '1.5rem' }} />
            <p style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--txt)', marginBottom: '1.5rem',
            }}>Leave a response</p>
            {isLegacy ? (
              <DisqusComments slug={post.slug} title={post.title} path={`/ideas/${post.slug}`} />
            ) : (
              <CommentForm postId={post.id} section="ideas" />
            )}
          </div>
        </section>
      </main>

      <SiteFooter section="03 / Ideas" />
    </>
  )
}
