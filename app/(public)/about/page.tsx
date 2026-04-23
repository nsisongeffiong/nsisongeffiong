// app/(public)/about/page.tsx
export const dynamic = 'force-dynamic'

import { SiteNav }    from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { db }         from '@/lib/db'
import { aboutContent } from '@/lib/db/schema'

export const metadata = {
  title: 'About — Nsisong Effiong',
  description: 'Poet, engineer, and essayist based in Lagos.',
}

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let result = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i] }
  }
  return result
}
function getVolume(year: number) {
  return `Vol. ${toRoman(year - 2011 + 1)}`
}

function getCurrentQuarterBooks(
  bookList: Record<string, { title: string; author: string }[]>
): { title: string; author: string }[] {
  const month   = new Date().getMonth() + 1
  const quarter = Math.ceil(month / 3)
  const qMonths = [1, 2, 3].map(offset => String((quarter - 1) * 3 + offset))
  return qMonths.flatMap(m => bookList[m] ?? [])
}

export default async function AboutPage() {
  const rows  = await db.select().from(aboutContent).limit(1)
  const data  = rows[0]

  const nowItems     = data?.nowItems ?? []
  const bookList     = data?.bookList ?? {}
  const quarterBooks = getCurrentQuarterBooks(bookList)

  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const vol   = getVolume(year)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)', minHeight: '100vh' }}>
      <SiteNav />

      {/* Banner */}
      <div className="about-banner">
        <div>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--txt3)', display: 'block', marginBottom: '1rem',
          }}>About the author</span>
          <h1 style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800,
            lineHeight: 0.88, letterSpacing: '-0.04em', color: 'var(--txt)',
          }}>Nsisong<br />Effiong</h1>
        </div>
        <div className="about-banner-tagline">
          <p style={{
            fontFamily: 'var(--font-source-serif), serif', fontSize: '14px',
            fontStyle: 'italic', fontWeight: 300, color: 'var(--txt2)',
            lineHeight: 1.75, marginBottom: '0.75rem',
          }}>
            Poet, engineer, and essayist based in Lagos. Writing at the intersection
            of language, technology, and public life.
          </p>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px',
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt3)',
          }}>Est. 2011</span>
        </div>
      </div>

      {/* 3-col editorial grid */}
      <div className="about-grid">

        {/* Col 1 — portrait + contact + dateline */}
        <div className="about-col about-col-border">
          <div style={{
            width: '100%', aspectRatio: '1 / 1', background: 'var(--bg3)',
            border: '0.5px solid var(--bdr2)', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                 stroke="var(--txt3)" strokeWidth="1">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt3)',
            }}>Portrait</span>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--txt3)',
              borderBottom: '0.5px solid var(--bdr)', paddingBottom: '0.5rem',
              marginBottom: '0.75rem',
            }}>Contact</div>
            {([
              ['Email',    'mailto:hello@nsisongeffiong.com',       'hello@nsisongeffiong.com'],
              ['GitHub',   'https://github.com/nsisongeffiong',     'github.com/nsisongeffiong'],
              ['Substack', 'https://nsisong.substack.com',          'nsisong.substack.com'],
              ['LinkedIn', 'https://linkedin.com/in/nsisongeffiong','linkedin.com/in/nsisongeffiong'],
            ] as const).map(([label, href, display]) => (
              <div key={label} style={{ padding: '0.6rem 0', borderBottom: '0.5px solid var(--bdr)' }}>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
                  color: 'var(--txt3)', display: 'block', marginBottom: '0.15rem',
                }}>{label}</span>
                <a href={href} style={{
                  fontFamily: 'var(--font-syne), sans-serif', fontSize: '11px',
                  color: 'var(--amber)', textDecoration: 'none',
                }}>{display}</a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid var(--bdr)' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt3)', lineHeight: 1.9,
            }}>
              Lagos, Nigeria<br />{month}<br />{vol}
            </div>
          </div>
        </div>

        {/* Col 2 — biography */}
        <div className="about-col about-col-border">
          <div style={{
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--amber)', fontWeight: 600, marginBottom: '1.25rem',
          }}>Biography</div>

          <p style={{
            fontFamily: 'var(--font-source-serif), serif', fontSize: '15px',
            lineHeight: 1.9, color: 'var(--txt)', fontWeight: 300, marginBottom: '1.25rem',
          } as React.CSSProperties}>
            I grew up between the Niger Delta and Lagos, and the tension between those two
            places — between water and concrete, between patience and speed — has shaped
            everything I make.
          </p>
          <p style={{
            fontFamily: 'var(--font-source-serif), serif', fontSize: '14px',
            lineHeight: 1.9, color: 'var(--txt2)', fontWeight: 300, marginBottom: '1.25rem',
          } as React.CSSProperties}>
            I build AI systems by profession and write poetry and essays by compulsion.
            This site is where those two practices interrogate each other.
          </p>
          <p style={{
            fontFamily: 'var(--font-source-serif), serif', fontSize: '14px',
            lineHeight: 1.9, color: 'var(--txt2)', fontWeight: 300,
          } as React.CSSProperties}>
            I am interested in what technology distributes, who governance forgets,
            and why both questions sound different depending on where you&apos;re standing.
          </p>

          <div style={{ margin: '2rem 0', borderLeft: '2px solid var(--amber)', paddingLeft: '1.1rem' }}>
            <p style={{
              fontFamily: 'var(--font-syne), sans-serif', fontSize: '15px',
              fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.015em',
              color: 'var(--txt)', marginBottom: '0.5rem',
            }}>
              &ldquo;The poem wants to stay in the image. The essay wants to follow the argument.&rdquo;
            </p>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--txt3)',
            }}>— on writing</span>
          </div>

          <div style={{ paddingTop: '1.5rem', borderTop: '0.5px solid var(--bdr)' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt3)', marginBottom: '0.75rem',
            }}>Also published in</div>
            {['Straight Talk Nigeria', 'The Republic', 'Rest of World (contributor)'].map((p) => (
              <p key={p} style={{
                fontFamily: 'var(--font-source-serif), serif', fontStyle: 'italic',
                fontWeight: 300, fontSize: '13px', color: 'var(--txt2)', marginBottom: '0.35rem',
              }}>{p}</p>
            ))}
          </div>
        </div>

        {/* Col 3 — now + reading + roles */}
        <div className="about-col">
          <div style={{
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--amber)', fontWeight: 600, marginBottom: '1.25rem',
          }}>Now</div>

          {nowItems.length > 0 ? nowItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '0.75rem', marginBottom: '0.75rem',
              paddingBottom: '0.75rem', borderBottom: '0.5px solid var(--bdr)',
              alignItems: 'baseline',
            }}>
              <span style={{
                fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
                color: 'var(--amber)', flexShrink: 0,
              }}>→</span>
              <span style={{
                fontFamily: 'var(--font-source-serif), serif', fontSize: '13px',
                lineHeight: 1.65, color: 'var(--txt2)', fontWeight: 300,
              }}>{item}</span>
            </div>
          )) : (
            <p style={{
              fontFamily: 'var(--font-source-serif), serif', fontSize: '13px',
              color: 'var(--txt3)', fontStyle: 'italic',
            }}>Nothing here yet.</p>
          )}

          <div style={{ marginTop: '1.75rem' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt3)', marginBottom: '0.85rem',
            }}>Reading</div>

            {quarterBooks.length > 0 ? quarterBooks.map(({ title, author }, i) => (
              <div key={title} style={{
                marginBottom: '0.75rem', paddingBottom: '0.75rem',
                borderBottom: i < quarterBooks.length - 1 ? '0.5px solid var(--bdr)' : 'none',
              }}>
                <p style={{
                  fontFamily: 'var(--font-source-serif), serif', fontStyle: 'italic',
                  fontWeight: 300, fontSize: '13px', color: 'var(--txt)', marginBottom: '0.15rem',
                }}>{title}</p>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', color: 'var(--txt3)',
                }}>{author}</span>
              </div>
            )) : (
              <p style={{
                fontFamily: 'var(--font-source-serif), serif', fontSize: '13px',
                color: 'var(--txt3)', fontStyle: 'italic',
              }}>No books listed for this quarter.</p>
            )}
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '0.5px solid var(--bdr)' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt3)', marginBottom: '0.75rem',
            }}>Roles</div>
            {(['Poet', 'Engineer', 'Essayist'] as const).map((role, i) => (
              <p key={role} style={{
                fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic',
                fontWeight: 300, fontSize: '20px', lineHeight: 1.35,
                color: i === 0 ? 'var(--txt)' : 'var(--txt2)',
              }}>{role}</p>
            ))}
          </div>
        </div>

      </div>

      <SiteFooter />
    </div>
  )
}
