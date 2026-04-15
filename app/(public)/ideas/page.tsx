import { SiteNav } from '@/components/shared/SiteNav';

const leadEssay = {
  kicker: 'Governance',
  title: 'On the Architecture of Public Trust',
  excerpt:
    'Trust is not a sentiment — it is infrastructure. This essay traces how institutional design either builds or erodes the architecture of public confidence, from procurement to policy feedback loops.',
  date: '2024-12-05',
  readTime: '18 min',
  volume: 'Vol. III',
};

const sidebarEssays = [
  {
    kicker: 'Education',
    title: 'The Curriculum as Political Document',
    date: '2024-11-18',
    readTime: '14 min',
  },
  {
    kicker: 'Urban Policy',
    title: 'Who Owns the Sidewalk?',
    date: '2024-10-30',
    readTime: '11 min',
  },
  {
    kicker: 'Public Health',
    title: 'Data, Dignity, and Disease Surveillance',
    date: '2024-10-12',
    readTime: '16 min',
  },
];

const pullQuote = {
  text: 'The most dangerous policy is the one that sounds like common sense but has never been tested against the lives it claims to improve.',
  attribution: '— from "On the Architecture of Public Trust"',
};

const topics = [
  'All',
  'Governance',
  'Education',
  'Urban Policy',
  'Public Health',
  'Economics',
];

const essayGrid = [
  {
    kicker: 'Economics',
    title: 'The Informal Economy Is Not a Market Failure',
    excerpt:
      'Rethinking how we measure economic activity when the majority of labour exists outside formal structures.',
    date: '2024-09-28',
    readTime: '13 min',
  },
  {
    kicker: 'Governance',
    title: 'Bureaucracy as Care Work',
    excerpt:
      'What would it mean to design government systems the way we design care — with patience, iteration, and attention to the person in front of us?',
    date: '2024-09-10',
    readTime: '15 min',
  },
  {
    kicker: 'Education',
    title: 'After the Textbook: Knowledge in the Age of Search',
    excerpt:
      'The textbook is no longer the canonical unit of knowledge. What replaces it, and what do we lose in the transition?',
    date: '2024-08-25',
    readTime: '10 min',
  },
];

export default function IdeasPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--txt)',
      }}
    >
      <SiteNav />

      {/* ── Masthead ── */}
      <section
        style={{
          maxWidth: '1060px',
          margin: '0 auto',
          padding: '4rem 1.5rem 2rem',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--amber)',
            marginBottom: '0.5rem',
          }}
        >
          Essays · Policy · Public Thought
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingBottom: '1rem',
            borderBottom: '3px solid var(--txt)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(3.5rem, 8vw, 5rem)',
              lineHeight: 1,
              color: 'var(--txt)',
            }}
          >
            Ideas
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--txt-secondary)',
              letterSpacing: '0.05em',
            }}
          >
            Vol. III — 2024
          </span>
        </div>
      </section>

      {/* ── Top Grid: Lead + Sidebar ── */}
      <section
        style={{
          maxWidth: '1060px',
          margin: '0 auto',
          padding: '2rem 1.5rem 3rem',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '0',
        }}
      >
        {/* Lead essay */}
        <article
          style={{
            paddingRight: '2.5rem',
            borderRight: '0.5px solid var(--bdr)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--amber)',
            }}
          >
            {leadEssay.kicker}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 700,
              fontSize: '1.85rem',
              lineHeight: 1.2,
              color: 'var(--txt)',
            }}
          >
            <a
              href="/ideas/on-the-architecture-of-public-trust"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {leadEssay.title}
            </a>
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontSize: '1.05rem',
              lineHeight: 1.75,
              color: 'var(--txt-secondary)',
            }}
          >
            {leadEssay.excerpt}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              color: 'var(--txt-secondary)',
              marginTop: 'auto',
            }}
          >
            <time dateTime={leadEssay.date}>
              {new Date(leadEssay.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </time>
            <span>{leadEssay.readTime}</span>
            <span style={{ color: 'var(--amber)' }}>{leadEssay.volume}</span>
          </div>
        </article>

        {/* Sidebar */}
        <aside
          style={{
            paddingLeft: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}
        >
          {sidebarEssays.map((essay, i) => (
            <article
              key={essay.title}
              style={{
                padding: '1.25rem 0',
                borderBottom:
                  i < sidebarEssays.length - 1
                    ? '0.5px solid var(--bdr)'
                    : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--amber)',
                }}
              >
                {essay.kicker}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: 1.3,
                  color: 'var(--txt)',
                }}
              >
                <a
                  href={`/ideas/${essay.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {essay.title}
                </a>
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  color: 'var(--txt-secondary)',
                }}
              >
                <time dateTime={essay.date}>
                  {new Date(essay.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
                <span>{essay.readTime}</span>
              </div>
            </article>
          ))}
        </aside>
      </section>

      {/* ── Pull Quote Strip ── */}
      <section
        style={{
          background: 'var(--amber-pq)',
          padding: '3rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '780px',
            margin: '0 auto',
            borderLeft: '4px solid var(--amber)',
            paddingLeft: '1.5rem',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontStyle: 'italic',
              fontSize: '1.35rem',
              lineHeight: 1.65,
              color: 'var(--txt)',
              marginBottom: '0.75rem',
            }}
          >
            &ldquo;{pullQuote.text}&rdquo;
          </p>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              color: 'var(--txt-secondary)',
            }}
          >
            {pullQuote.attribution}
          </p>
        </div>
      </section>

      {/* ── Topic Filter Chips ── */}
      <nav
        style={{
          maxWidth: '1060px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {topics.map((t, i) => (
          <button
            key={t}
            type="button"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: i === 0 ? 'var(--amber)' : 'transparent',
              color: i === 0 ? 'var(--bg)' : 'var(--txt-secondary)',
              border:
                i === 0 ? '1px solid var(--amber)' : '1px solid var(--bdr)',
              borderRadius: '2px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* ── Essay Card Grid ── */}
      <section
        style={{
          maxWidth: '1060px',
          margin: '0 auto',
          padding: '1rem 1.5rem 5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
        }}
      >
        {essayGrid.map((essay) => (
          <article
            key={essay.title}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              paddingBottom: '1.5rem',
              borderBottom: '0.5px solid var(--bdr)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--amber)',
              }}
            >
              {essay.kicker}
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 700,
                fontSize: '1.15rem',
                lineHeight: 1.3,
                color: 'var(--txt)',
              }}
            >
              <a
                href={`/ideas/${essay.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {essay.title}
              </a>
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-source-serif), serif',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--txt-secondary)',
              }}
            >
              {essay.excerpt}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.65rem',
                color: 'var(--txt-secondary)',
                marginTop: 'auto',
              }}
            >
              <time dateTime={essay.date}>
                {new Date(essay.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
              <span>{essay.readTime}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
