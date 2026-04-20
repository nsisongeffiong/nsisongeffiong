import { SiteNav } from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { CommentForm } from '@/components/shared/CommentForm'
import { DisqusComments } from '@/components/shared/DisqusComments'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { posts, comments } from '@/lib/db/schema'
import { eq, and, lt, gt, desc, asc } from 'drizzle-orm'

export default async function TechSinglePage({
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
    .where(and(eq(posts.type, 'tech'), eq(posts.published, true), lt(posts.publishedAt, post.publishedAt!)))
    .orderBy(desc(posts.publishedAt))
    .limit(1)

  const [nextPost] = await db
    .select({ title: posts.title, slug: posts.slug })
    .from(posts)
    .where(and(eq(posts.type, 'tech'), eq(posts.published, true), gt(posts.publishedAt, post.publishedAt!)))
    .orderBy(asc(posts.publishedAt))
    .limit(1)

  const approvedComments = await db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, post.id), eq(comments.status, 'approved')))

  const headingRegex = /(<h([23])[^>]*>)(.*?)<\/h[23]>/gi
  const tocItems: { level: string; text: string; id: string }[] = []
  const contentWithIds = post.content.replace(headingRegex, (_full, openTag: string, level: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    tocItems.push({ level, text, id })
    const newOpenTag = openTag.includes(' id=') ? openTag : openTag.replace('>', ` id="${id}">`)
    return `${newOpenTag}${inner}</h${level}>`
  })

  const meta      = post.metadata as any
  const readTime  = meta?.readTime ?? null
  const isLegacy  = meta?.legacyDisqus === true
  const date      = post.publishedAt
    ? post.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <>
      <SiteNav />

      <main style={{ background: 'var(--bg)', color: 'var(--txt)' }}>

        {/* ── Sub-nav ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.5rem 2rem 0',
          borderBottom: '0.5px solid var(--bdr)',
          paddingBottom: '1rem',
        }}>
          <Link href="/tech" style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '12px', color: 'var(--txt2)', textDecoration: 'none',
          }}>← ~/tech</Link>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', color: 'var(--teal-mid)',
            maxWidth: '60%', textAlign: 'right',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>~/{post.slug}</span>
        </div>

        {/* ── Hero — surface card, no green bleed ── */}
        <header style={{
          padding: '3rem 2rem 2.5rem',
          borderBottom: '0.5px solid var(--bdr)',
        }}>
          {/* Tags */}
          {(post.tags ?? []).length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {(post.tags ?? []).map((tag) => (
                <span key={tag} style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px', padding: '4px 10px',
                  border: '0.5px solid var(--bdr2)', borderRadius: '999px',
                  color: 'var(--teal-mid)',
                }}>{tag}</span>
              ))}
            </div>
          )}

          <h1 style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 'clamp(24px, 4vw, 44px)',
            fontWeight: 500, letterSpacing: '-0.03em',
            lineHeight: 1.1, color: 'var(--txt)',
            marginBottom: '1rem', maxWidth: '28ch',
          }}>{post.title}</h1>

          {post.excerpt && (
            <p style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '17px', lineHeight: 1.55,
              color: 'var(--txt2)', maxWidth: '56ch',
              marginBottom: '1.5rem', fontWeight: 400,
            }}>{post.excerpt}</p>
          )}

          <div style={{
            display: 'flex', gap: '1.5rem',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', color: 'var(--txt3)',
          }}>
            {date && <span style={{ color: 'var(--txt2)' }}>{date}</span>}
            {readTime && <span>{readTime} min read</span>}
            <span>Nsisong Effiong</span>
          </div>
        </header>

        {/* ── Body: main + sidebar ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 220px',
        }}>
          {/* Main content */}
          <article
            className="tech-content"
            style={{
              padding: '3rem 2rem',
              borderRight: '0.5px solid var(--bdr)',
            }}
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

          {/* Sidebar */}
          <aside style={{
            padding: '3rem 1.75rem',
            background: 'var(--bg2)',
            alignSelf: 'start',
            position: 'sticky', top: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--txt3)', display: 'block', marginBottom: '1rem',
            }}>// contents</span>

            {tocItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: item.level === '2' ? '12px' : '11px',
                color: item.level === '2' ? 'var(--teal-mid)' : 'var(--txt2)',
                display: 'block', padding: '0.5rem 0',
                borderBottom: '0.5px solid var(--bdr)',
                textDecoration: 'none',
                paddingLeft: item.level === '3' ? '0.75rem' : '0',
              }}>{item.text}</a>
            ))}
          </aside>
        </div>

        {/* ── Prev / Next ── */}
        <nav style={{
          borderTop: '0.5px solid var(--bdr)',
          padding: '1.75rem 2rem',
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px',
        }}>
          <div>
            {prevPost && (
              <Link href={`/tech/${prevPost.slug}`} style={{ textDecoration: 'none' }}>
                <span style={{ display: 'block', color: 'var(--txt3)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>← Previous</span>
                <span style={{ color: 'var(--txt2)' }}>{prevPost.title}</span>
              </Link>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            {nextPost && (
              <Link href={`/tech/${nextPost.slug}`} style={{ textDecoration: 'none' }}>
                <span style={{ display: 'block', color: 'var(--txt3)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Next →</span>
                <span style={{ color: 'var(--teal-mid)' }}>{nextPost.title}</span>
              </Link>
            )}
          </div>
        </nav>

        {/* ── Comments ── */}
        <section style={{ padding: '3rem 2rem 4rem', borderTop: '0.5px solid var(--bdr)' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: '2.25rem',
          }}>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt)',
            }}>// discussion</span>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px', color: 'var(--teal-mid)',
            }}>{approvedComments.length} comments</span>
          </div>

          {approvedComments.map((comment) => (
            <div key={comment.id} style={{ padding: '1.5rem 0', borderBottom: '0.5px solid var(--bdr)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--teal-pale)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '10px', fontWeight: 500, color: 'var(--teal-txt)',
                    flexShrink: 0,
                  }}>
                    {comment.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontSize: '13px', fontWeight: 600, color: 'var(--txt)',
                  }}>{comment.authorName}</span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '11px', color: 'var(--txt3)',
                }}>
                  {comment.createdAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '14px', lineHeight: 1.7,
                color: 'var(--txt2)',
                paddingLeft: 'calc(28px + 0.75rem)',
              }}>{comment.body}</p>
            </div>
          ))}

          {/* Comment form */}
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '0.5px solid var(--bdr)' }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt2)', marginBottom: '1.5rem',
            }}>// add a comment</p>
            {isLegacy ? (
              <DisqusComments slug={post.slug} title={post.title} path={`/tech/${post.slug}`} />
            ) : (
              <CommentForm postId={post.id} section="tech" />
            )}
          </div>
        </section>
      </main>

      <SiteFooter section="02 / Tech" />
    </>
  )
}
