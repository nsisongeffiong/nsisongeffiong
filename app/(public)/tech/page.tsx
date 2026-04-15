import { SiteNav } from '@/components/shared/SiteNav';

const filters = ['all', 'AI/ML', 'systems', 'web', 'devtools'];

const articles = [
  {
    num: '01',
    tag: 'AI/ML',
    title: 'Building Resilient ML Pipelines at Scale',
    excerpt:
      'How to design machine learning infrastructure that survives the chaos of production — retry semantics, circuit breakers, and graceful degradation.',
    date: '2024-12-10',
    readTime: '12 min',
  },
  {
    num: '02',
    tag: 'systems',
    title: 'Event Sourcing Beyond the Hype',
    excerpt:
      'A practical look at when event sourcing works, when it doesn\'t, and what the blog posts leave out about schema evolution.',
    date: '2024-11-22',
    readTime: '9 min',
  },
  {
    num: '03',
    tag: 'web',
    title: 'Server Components and the Death of the Waterfall',
    excerpt:
      'React Server Components fundamentally change how we think about data fetching. Here\'s a migration path that won\'t break your app.',
    date: '2024-11-05',
    readTime: '8 min',
  },
];

const stats = [
  { label: 'articles published', value: '24' },
  { label: 'avg words', value: '2,400' },
  { label: 'topics covered', value: '6' },
];

export default function TechPage() {
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
          background: 'var(--teal-hero)',
          padding: '4rem 1.5rem 3.5rem',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.8rem',
              color: 'var(--teal-mid)',
              marginBottom: '0.5rem',
            }}
          >
            # engineering blog
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontWeight: 400,
              fontSize: 'clamp(2.4rem, 6vw, 3.5rem)',
              lineHeight: 1.1,
              color: 'var(--teal-txt)',
              marginBottom: '1rem',
            }}
          >
            ./tech
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              color: 'var(--teal-txt)',
              maxWidth: '560px',
              marginBottom: '1.5rem',
              opacity: 0.85,
            }}
          >
            Deep dives into AI/ML systems, web infrastructure, and the developer
            tools that make complex work feel simple.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['AI/ML', 'systems', 'web', 'devtools'].map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  border: '1px solid var(--teal-mid)',
                  color: 'var(--teal-mid)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '2px',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter Chips ── */}
      <nav
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '2rem 1.5rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {filters.map((f, i) => (
          <button
            key={f}
            type="button"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: i === 0 ? 'var(--teal-hero)' : 'transparent',
              color: i === 0 ? 'var(--teal-mid)' : 'var(--txt-secondary)',
              border:
                i === 0
                  ? '1px solid var(--teal-hero)'
                  : '1px solid var(--bdr)',
              borderRadius: '2px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </nav>

      {/* ── Article List ── */}
      <section
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '1rem 1.5rem 4rem',
        }}
      >
        {articles.map((a) => (
          <article
            key={a.num}
            style={{
              display: 'grid',
              gridTemplateColumns: '3rem 1fr',
              gap: '1.5rem',
              padding: '2rem 0',
              borderBottom: '0.5px solid var(--bdr)',
            }}
          >
            {/* Number */}
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '1.5rem',
                fontWeight: 400,
                color: 'var(--teal-mid)',
                lineHeight: 1,
                paddingTop: '0.15rem',
              }}
            >
              {a.num}
            </span>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--teal-hero)',
                  border: '1px solid var(--teal-hero)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '2px',
                  alignSelf: 'flex-start',
                }}
              >
                {a.tag}
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 700,
                  fontSize: '1.35rem',
                  lineHeight: 1.25,
                  color: 'var(--txt)',
                }}
              >
                <a
                  href={`/tech/${a.title.toLowerCase().replace(/ /g, '-')}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {a.title}
                </a>
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.7,
                  color: 'var(--txt-secondary)',
                }}
              >
                {a.excerpt}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  color: 'var(--txt-secondary)',
                }}
              >
                <time dateTime={a.date}>
                  {new Date(a.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
                <span>{a.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ── Stats Bar ── */}
      <section
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '0.5px solid var(--bdr)',
            borderBottom: '0.5px solid var(--bdr)',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                borderRight:
                  i < stats.length - 1 ? '0.5px solid var(--bdr)' : 'none',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '2rem',
                  fontWeight: 400,
                  color: 'var(--teal-mid)',
                  marginBottom: '0.35rem',
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--txt-secondary)',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
