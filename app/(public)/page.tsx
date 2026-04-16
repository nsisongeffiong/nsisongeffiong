export const dynamic = 'force-dynamic'

import { SiteNav } from '@/components/shared/SiteNav'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default async function HomePage() {
  // Latest per section for cards
  const [latestPoetry, latestTech, latestIdeas] = await Promise.all([
    db.select({ title: posts.title, slug: posts.slug })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'poetry')))
      .orderBy(desc(posts.publishedAt)).limit(1),
    db.select({ title: posts.title, slug: posts.slug })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'tech')))
      .orderBy(desc(posts.publishedAt)).limit(1),
    db.select({ title: posts.title, slug: posts.slug })
      .from(posts).where(and(eq(posts.published, true), eq(posts.type, 'ideas')))
      .orderBy(desc(posts.publishedAt)).limit(1),
  ])

  // Recent across all for the strip
  const recentRaw = await db
    .select({ id: posts.id, type: posts.type, title: posts.title, slug: posts.slug, publishedAt: posts.publishedAt })
    .from(posts).where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt)).limit(3)

  const recentPosts = recentRaw.map((p) => ({
    type:  p.type.charAt(0).toUpperCase() + p.type.slice(1),
    title: p.title,
    date:  p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : '',
    href:  `/${p.type}/${p.slug}`,
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--txt)' }}>
      <SiteNav />

      {/* ── Hero ── */}
      <div style={{ padding: '4rem 2rem 2.5rem', maxWidth: '700px' }}>
        <span style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: '10px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--txt3)',
          marginBottom: '1.5rem',
          display: 'block',
        }}>
          Writer · Engineer · Thinker
        </span>
        <h1 style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 'clamp(42px, 6.5vw, 72px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          marginBottom: '1.5rem',
          color: 'var(--txt)',
        }}>
          Words that build<br />
          <em style={{ fontStyle: 'italic', color: 'var(--txt2)' }}>worlds &amp; systems.</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: '18px',
          fontStyle: 'italic',
          color: 'var(--txt2)',
          lineHeight: 1.8,
          maxWidth: '460px',
          marginBottom: '2.5rem',
        }}>
          Poetry, code, and public thought — three modes of making sense of the world.
        </p>
        <div style={{ width: '36px', height: '1px', background: 'var(--bdr2)' }} />
      </div>

      {/* ── Section label ── */}
      <p style={{
        fontFamily: 'var(--font-syne), sans-serif',
        fontSize: '10px',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--txt3)',
        padding: '1.1rem 2rem',
      }}>
        Explore by category
      </p>

      {/* ── Section Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '0.5px solid var(--bdr)',
      }}>

        {/* Poetry Card */}
        <a href="/poetry" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{
            padding: '2rem',
            borderRight: '0.5px solid var(--bdr)',
            position: 'relative',
            cursor: 'pointer',
            height: '100%',
          }}>
            <span style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 500,
              marginBottom: '1.1rem',
              display: 'inline-block',
              padding: '3px 9px',
              borderRadius: '2px',
              background: 'var(--purple-bg)',
              color: 'var(--purple-txt)',
            }}>Poetry</span>
            <h2 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '24px',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.2,
              marginBottom: '0.6rem',
              color: 'var(--txt)',
            }}>The literary space</h2>
            <p style={{
              fontSize: '13px',
              color: 'var(--txt2)',
              lineHeight: 1.65,
              marginBottom: '1.4rem',
            }}>
              Verse, imagery, and language pressed into new shapes. Poetry as a way of knowing.
            </p>
            <div style={{ borderTop: '0.5px solid var(--bdr)', paddingTop: '1rem' }}>
              <p style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--txt3)',
                marginBottom: '0.45rem',
              }}>Latest</p>
              <p style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--txt)',
              }}>
                {latestPoetry[0]?.title ? `"${latestPoetry[0].title}"` : ''}
              </p>
            </div>
            <span style={{
              position: 'absolute',
              bottom: '1.6rem',
              right: '1.6rem',
              fontSize: '15px',
              color: 'var(--txt3)',
            }}>↗</span>
          </div>
        </a>

        {/* Tech Card */}
        <a href="/tech" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{
            padding: '2rem',
            borderRight: '0.5px solid var(--bdr)',
            position: 'relative',
            cursor: 'pointer',
            height: '100%',
          }}>
            <span style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 500,
              marginBottom: '1.1rem',
              display: 'inline-block',
              padding: '3px 9px',
              borderRadius: '2px',
              background: 'var(--teal-pale)',
              color: 'var(--teal-txt)',
            }}>Tech</span>
            <h2 style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: 1.2,
              marginBottom: '0.6rem',
              color: 'var(--txt)',
            }}>./engineering</h2>
            <p style={{
              fontSize: '13px',
              color: 'var(--txt2)',
              lineHeight: 1.65,
              marginBottom: '1.4rem',
            }}>
              Deep dives on AI systems, software architecture, and building with emerging tools.
            </p>
            <div style={{ borderTop: '0.5px solid var(--bdr)', paddingTop: '1rem' }}>
              <p style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--txt3)',
                marginBottom: '0.45rem',
              }}>Latest</p>
              <p style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '11px',
                lineHeight: 1.6,
                color: 'var(--txt)',
              }}>
                {latestTech[0]?.title ?? ''}
              </p>
            </div>
            <span style={{
              position: 'absolute',
              bottom: '1.6rem',
              right: '1.6rem',
              fontSize: '15px',
              color: 'var(--txt3)',
            }}>↗</span>
          </div>
        </a>

        {/* Ideas Card */}
        <a href="/ideas" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{
            padding: '2rem',
            position: 'relative',
            cursor: 'pointer',
            height: '100%',
          }}>
            <span style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 500,
              marginBottom: '1.1rem',
              display: 'inline-block',
              padding: '3px 9px',
              borderRadius: '2px',
              background: 'var(--amber-bg)',
              color: 'var(--amber-txt)',
            }}>Ideas</span>
            <h2 style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: 1.2,
              marginBottom: '0.6rem',
              letterSpacing: '-0.01em',
              color: 'var(--txt)',
            }}>Essays &amp; Policy</h2>
            <p style={{
              fontSize: '13px',
              color: 'var(--txt2)',
              lineHeight: 1.65,
              marginBottom: '1.4rem',
            }}>
              Writing on governance, technology in society, and ideas that deserve more friction.
            </p>
            <div style={{ borderTop: '0.5px solid var(--bdr)', paddingTop: '1rem' }}>
              <p style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--txt3)',
                marginBottom: '0.45rem',
              }}>Latest</p>
              <p style={{
                fontSize: '12px',
                lineHeight: 1.5,
                color: 'var(--txt)',
              }}>
                {latestIdeas[0]?.title ?? ''}
              </p>
            </div>
            <span style={{
              position: 'absolute',
              bottom: '1.6rem',
              right: '1.6rem',
              fontSize: '15px',
              color: 'var(--txt3)',
            }}>↗</span>
          </div>
        </a>

      </div>

      {/* ── Recent Posts Strip ── */}
      <div style={{ borderTop: '0.5px solid var(--bdr)', padding: '1.75rem 2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '1.1rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--txt3)',
          }}>Recent across all categories</span>
          <span style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '11px',
            color: 'var(--txt3)',
          }}>View all →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.1rem' }}>
          {recentPosts.map((post) => (
            <a key={post.href} href={post.href} style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--txt3)',
                display: 'block',
                marginBottom: '0.3rem',
              }}>{post.type}</span>
              <span style={{
                display: 'block',
                fontFamily: post.type === 'Poetry'
                  ? 'var(--font-cormorant), serif'
                  : post.type === 'Tech'
                  ? 'var(--font-dm-mono), monospace'
                  : 'var(--font-syne), sans-serif',
                fontStyle: post.type === 'Poetry' ? 'italic' : 'normal',
                fontSize: post.type === 'Tech' ? '11px' : post.type === 'Poetry' ? '14px' : '12px',
                color: 'var(--txt)',
              }}>{post.title}</span>
              {post.date && (
                <span style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '11px',
                  color: 'var(--txt3)',
                  display: 'block',
                  marginTop: '0.3rem',
                }}>
                  {formatDate(post.date)}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '0.5px solid var(--bdr)',
        padding: '1.1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-cormorant), serif',
        fontSize: '13px',
        fontStyle: 'italic',
        color: 'var(--txt3)',
      }}>
        <span>nsisongeffiong.com</span>
        <span>© {new Date().getFullYear()} · All writing reserved</span>
      </footer>
    </div>
  )
}
