import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { CommentForm } from '@/components/shared/CommentForm'
import { DisqusComments } from '@/components/shared/DisqusComments'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { posts, comments } from '@/lib/db/schema'
import { eq, and, lt, gt, desc, asc } from 'drizzle-orm'

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

  // Prev / next within poetry section
  const [prevPost] = await db
    .select({ title: posts.title, slug: posts.slug })
    .from(posts)
    .where(
      and(
        eq(posts.type, 'poetry'),
        eq(posts.published, true),
        lt(posts.publishedAt, post.publishedAt!)
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(1)

  const [nextPost] = await db
    .select({ title: posts.title, slug: posts.slug })
    .from(posts)
    .where(
      and(
        eq(posts.type, 'poetry'),
        eq(posts.published, true),
        gt(posts.publishedAt, post.publishedAt!)
      )
    )
    .orderBy(asc(posts.publishedAt))
    .limit(1)

  const approvedComments = await db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, post.id), eq(comments.status, 'approved')))

  // Process poem HTML: mark empty paragraphs as stanza breaks
  function processPoem(html: string): string {
    return html
      .replace(/<p><\/p>/g, '<p class="stanza-break"></p>')
      .replace(/<p><br\s*\/?><\/p>/gi, '<p class="stanza-break"></p>')
      .replace(/<p><br[^>]+><\/p>/gi, '<p class="stanza-break"></p>')
  }
  const poemHtml = processPoem(post.content)

  const meta      = post.metadata as any
  const category  = meta?.category ?? post.tags?.[0] ?? 'Poetry'
  const poetNote  = meta?.poetNote ?? null
  const isLegacy  = meta?.legacyDisqus === true
  const author    = meta?.authorName ?? 'Nsisong Effiong'
  const date      = post.publishedAt
    ? post.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <>
      <SiteNav />

      <main style={{ background: 'var(--bg)', color: 'var(--txt)' }}>

        {/* ── Back link ── */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '0.5px solid var(--bdr)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Link href="/poetry" style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontStyle: 'italic', fontSize: '14px',
            color: 'var(--txt2)', textDecoration: 'none',
          }}>← Poetry</Link>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', letterSpacing: '0.04em',
            color: 'var(--purple)',
          }}>{category}</span>
        </div>

        {/* ── Header ── */}
        <header style={{
          maxWidth: 580, margin: '0 auto',
          padding: '3rem 2rem 0', textAlign: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--purple)', display: 'inline-block', marginBottom: '1.25rem',
          }}>{category}</span>

          <h1 style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(32px, 5.5vw, 56px)',
            lineHeight: 1.05, letterSpacing: '-0.025em',
            marginBottom: '1.75rem', color: 'var(--txt)',
          }}>{post.title}</h1>

          <div style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', letterSpacing: '0.06em',
            color: 'var(--txt3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          }}>
            <span>{author}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--txt4)', display: 'inline-block' }} />
            <span>{date}</span>
          </div>
        </header>

        {/* ── Ornament ── */}
        <OrnamentalRule />

        {/* ── Poem body ── */}
        <article
          className="poem-content"
          style={{ maxWidth: 480, margin: '0 auto', padding: '0 2rem' }}
          dangerouslySetInnerHTML={{ __html: poemHtml }}
        />

        {/* ── End mark ── */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0 2.5rem',
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: '15px', color: 'var(--purple)',
          letterSpacing: '0.3em',
        }}>· · ·</div>

        {/* ── Poet's note ── */}
        {poetNote && (
          <section style={{ maxWidth: 480, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
            <div style={{ borderTop: '0.5px solid var(--bdr)', paddingTop: '1.75rem' }}>
              <span style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--txt3)', display: 'block', marginBottom: '0.75rem',
              }}>Poet's note</span>
              <p style={{
                fontFamily: 'var(--font-source-serif), serif',
                fontStyle: 'italic', fontWeight: 300,
                fontSize: '15px', lineHeight: 1.85, color: 'var(--txt2)',
              }}>{poetNote}</p>
            </div>
          </section>
        )}

        {/* ── Prev / Next ── */}
        {(prevPost || nextPost) && (
          <nav className="post-nav-grid" style={{
            maxWidth: 580, margin: '3rem auto 0',
            padding: '2rem 2rem',
            borderTop: '0.5px solid var(--bdr)',
          }}>
            <div>
              {prevPost && (
                <Link href={`/poetry/${prevPost.slug}`} style={{ textDecoration: 'none' }}>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: 'var(--txt3)', display: 'block', marginBottom: '0.5rem',
                  }}>← Previous</span>
                  <span style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic', fontWeight: 300,
                    fontSize: '17px', color: 'var(--txt)', lineHeight: 1.3,
                  }}>{prevPost.title}</span>
                </Link>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              {nextPost && (
                <Link href={`/poetry/${nextPost.slug}`} style={{ textDecoration: 'none' }}>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: 'var(--txt3)', display: 'block', marginBottom: '0.5rem',
                  }}>Next →</span>
                  <span style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic', fontWeight: 300,
                    fontSize: '17px', color: 'var(--txt)', lineHeight: 1.3,
                  }}>{nextPost.title}</span>
                </Link>
              )}
            </div>
          </nav>
        )}

        {/* ── Comments ── */}
        <section style={{ maxWidth: 580, margin: '0 auto', padding: '3rem 2rem 4rem' }}>
          <OrnamentalRule />

          {approvedComments.length > 0 && (
            <>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: '2.25rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--txt)',
                }}>Responses</span>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '11px', color: 'var(--purple)',
                }}>
                  {String(approvedComments.length).padStart(2, '0')} {approvedComments.length === 1 ? 'response' : 'responses'}
                </span>
              </div>

              {approvedComments.map((comment) => (
                <div key={comment.id} style={{
                  padding: '1.5rem 0',
                  borderBottom: '0.5px solid var(--bdr)',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: '0.75rem',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 600, fontSize: '14px',
                      letterSpacing: '-0.01em', color: 'var(--txt)',
                    }}>{comment.authorName}</span>
                    <span style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '11px', color: 'var(--txt3)',
                    }}>
                      {comment.createdAt?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic', fontWeight: 300,
                    fontSize: '16px', lineHeight: 1.85,
                    color: 'var(--txt2)', marginBottom: '0.75rem',
                  }}>{comment.body}</p>
                </div>
              ))}
            </>
          )}

          {/* Comment form */}
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '0.5px solid var(--bdr)' }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt2)', marginBottom: '1.5rem',
            }}>Leave a response</p>

            {isLegacy ? (
              <DisqusComments slug={post.slug} title={post.title} path={`/poetry/${post.slug}`} />
            ) : (
              <CommentForm postId={post.id} section="poetry" />
            )}
          </div>
        </section>
      </main>

      <SiteFooter section="01 / Poetry" />
    </>
  )
}

function OrnamentalRule() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '1rem', maxWidth: 580, margin: '3rem auto',
      padding: '0 2rem',
    }}>
      <span style={{ flex: 1, height: '0.5px', background: 'var(--bdr)' }} />
      <span style={{
        display: 'inline-block', width: 5, height: 5,
        borderRadius: '50%', background: 'var(--purple)',
      }} />
      <span style={{ flex: 1, height: '0.5px', background: 'var(--bdr)' }} />
    </div>
  )
}
