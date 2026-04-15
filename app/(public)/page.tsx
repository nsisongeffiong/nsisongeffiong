import { SiteNav } from '@/components/shared/SiteNav';

const recentPosts = [
  {
    type: 'Poetry',
    title: 'The River Remembers',
    date: '2024-12-15',
    href: '/poetry/the-river-remembers',
  },
  {
    type: 'Tech',
    title: 'Building Resilient ML Pipelines',
    date: '2024-12-10',
    href: '/tech/building-resilient-ml-pipelines',
  },
  {
    type: 'Ideas',
    title: 'On the Architecture of Public Trust',
    date: '2024-12-05',
    href: '/ideas/on-the-architecture-of-public-trust',
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--txt)',
      }}
    >
      <SiteNav />

      {/* ── Hero ── */}
      <section
        style={{
          textAlign: 'center',
          padding: '6rem 1.5rem 4rem',
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
            lineHeight: 1.1,
            color: 'var(--txt)',
            marginBottom: '1rem',
          }}
        >
          Nsisong Effiong
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '1.25rem',
            color: 'var(--txt-secondary)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Poet, engineer, and essayist — exploring language, systems, and the
          architecture of public thought.
        </p>
      </section>

      {/* ── Section Cards ── */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Poetry Card */}
        <article
          style={{
            border: '0.5px solid var(--bdr)',
            borderRadius: '2px',
            padding: '2rem',
            background: 'var(--bg2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '1.75rem',
                color: 'var(--txt)',
              }}
            >
              Poetry
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: '1px solid var(--purple-acc)',
                color: 'var(--purple-acc)',
                padding: '0.15rem 0.5rem',
                borderRadius: '2px',
              }}
            >
              verse
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--txt-secondary)',
            }}
          >
            Poems on memory, place, grief, and the textures of language — written
            in the space between music and meaning.
          </p>
          <div
            style={{
              borderTop: '0.5px solid var(--bdr)',
              paddingTop: '0.75rem',
              marginTop: 'auto',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--txt-secondary)',
                marginBottom: '0.35rem',
              }}
            >
              Latest
            </p>
            <p
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontSize: '1rem',
                color: 'var(--txt)',
              }}
            >
              &ldquo;The river carries what the mouth cannot hold…&rdquo;
            </p>
          </div>
          <a
            href="/poetry"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.8rem',
              color: 'var(--purple-acc)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            Read poems <span aria-hidden="true">→</span>
          </a>
        </article>

        {/* Tech Card */}
        <article
          style={{
            border: '0.5px solid var(--bdr)',
            borderRadius: '2px',
            padding: '2rem',
            background: 'var(--bg2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontWeight: 400,
                fontSize: '1.35rem',
                color: 'var(--txt)',
              }}
            >
              ./engineering
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: '1px solid var(--teal-hero)',
                color: 'var(--teal-hero)',
                padding: '0.15rem 0.5rem',
                borderRadius: '2px',
              }}
            >
              tech
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.85rem',
              lineHeight: 1.7,
              color: 'var(--txt-secondary)',
            }}
          >
            Deep dives into AI/ML systems, web architecture, and developer
            tooling — written with the precision of a commit message.
          </p>
          <div
            style={{
              borderTop: '0.5px solid var(--bdr)',
              paddingTop: '0.75rem',
              marginTop: 'auto',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--txt-secondary)',
                marginBottom: '0.35rem',
              }}
            >
              Latest
            </p>
            <p
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.85rem',
                color: 'var(--txt)',
              }}
            >
              Building Resilient ML Pipelines at Scale
            </p>
          </div>
          <a
            href="/tech"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.8rem',
              color: 'var(--teal-hero)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            Read articles <span aria-hidden="true">→</span>
          </a>
        </article>

        {/* Ideas Card */}
        <article
          style={{
            border: '0.5px solid var(--bdr)',
            borderRadius: '2px',
            padding: '2rem',
            background: 'var(--bg2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: 'var(--txt)',
              }}
            >
              Ideas
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: '1px solid var(--amber)',
                color: 'var(--amber)',
                padding: '0.15rem 0.5rem',
                borderRadius: '2px',
              }}
            >
              essays
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--txt-secondary)',
            }}
          >
            Long-form essays on policy, governance, and the public structures
            that shape how we live together.
          </p>
          <div
            style={{
              borderTop: '0.5px solid var(--bdr)',
              paddingTop: '0.75rem',
              marginTop: 'auto',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--txt-secondary)',
                marginBottom: '0.35rem',
              }}
            >
              Latest
            </p>
            <p
              style={{
                fontFamily: 'var(--font-source-serif), serif',
                fontSize: '1rem',
                color: 'var(--txt)',
              }}
            >
              On the Architecture of Public Trust
            </p>
          </div>
          <a
            href="/ideas"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.8rem',
              color: 'var(--amber)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            Read essays <span aria-hidden="true">→</span>
          </a>
        </article>
      </section>

      {/* ── Recent Posts Strip ── */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--txt-secondary)',
            marginBottom: '1.5rem',
            borderBottom: '0.5px solid var(--bdr)',
            paddingBottom: '0.5rem',
          }}
        >
          Recent
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {recentPosts.map((post) => (
            <a
              key={post.href}
              href={post.href}
              style={{
                textDecoration: 'none',
                color: 'var(--txt)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                padding: '1rem 0',
                borderBottom: '0.5px solid var(--bdr)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color:
                    post.type === 'Poetry'
                      ? 'var(--purple-acc)'
                      : post.type === 'Tech'
                        ? 'var(--teal-hero)'
                        : 'var(--amber)',
                }}
              >
                {post.type}
              </span>
              <span
                style={{
                  fontFamily:
                    post.type === 'Poetry'
                      ? 'var(--font-cormorant), serif'
                      : post.type === 'Tech'
                        ? 'var(--font-dm-mono), monospace'
                        : 'var(--font-syne), sans-serif',
                  fontStyle: post.type === 'Poetry' ? 'italic' : 'normal',
                  fontWeight: post.type === 'Ideas' ? 700 : 400,
                  fontSize: post.type === 'Tech' ? '0.9rem' : '1.1rem',
                }}
              >
                {post.title}
              </span>
              <time
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  color: 'var(--txt-secondary)',
                }}
                dateTime={post.date}
              >
                {new Date(post.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          textAlign: 'center',
          padding: '2rem 1.5rem 3rem',
          borderTop: '0.5px solid var(--bdr)',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '0.75rem',
            color: 'var(--txt-secondary)',
          }}
        >
          © {new Date().getFullYear()} Nsisong Effiong. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
