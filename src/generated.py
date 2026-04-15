

```tsx app/(public)/page.tsx
import SiteNav from '@/components/shared/SiteNav';
import Link from 'next/link';

const recentPosts = [
  {
    section: 'Poetry' as const,
    title: 'The Weight of Rivers',
    date: 'Apr 12, 2026',
    href: '/poetry/the-weight-of-rivers',
  },
  {
    section: 'Tech' as const,
    title: 'Building Resilient Edge Functions',
    date: 'Apr 10, 2026',
    href: '/tech/resilient-edge-functions',
  },
  {
    section: 'Ideas' as const,
    title: 'On the Architecture of Public Trust',
    date: 'Apr 8, 2026',
    href: '/ideas/architecture-of-public-trust',
  },
];

function SectionCard({
  section,
  title,
  titleStyle,
  latest,
  href,
}: {
  section: string;
  title: string;
  titleStyle: React.CSSProperties;
  latest: { title: string; excerpt: string };
  href: string;
}) {
  return (
    <div
      style={{
        flex: '1 1 0',
        padding: '2.5rem 2rem',
        borderRight: '1px solid var(--bdr)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--fg2)',
        }}
      >
        {section}
      </p>
      <h2 style={titleStyle}>{title}</h2>
      <div style={{ marginTop: 'auto' }}>
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--fg2)',
            marginBottom: '0.5rem',
          }}
        >
          Latest
        </p>
        <p
          style={{
            fontFamily: 'var(--font-source-serif), serif',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--fg)',
            marginBottom: '0.35rem',
          }}
        >
          {latest.title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-source-serif), serif',
            fontSize: '0.875rem',
            color: 'var(--fg2)',
            lineHeight: 1.5,
          }}
        >
          {latest.excerpt}
        </p>
      </div>
      <Link
        href={href}
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '0.8rem',
          color: 'var(--fg)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem',
        }}
      >
        Explore {section} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* Hero */}
        <section
          style={{
            padding: '8rem 2rem 6rem',
            textAlign: 'center',
            maxWidth: '720px',
            margin: '0 auto',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              lineHeight: 1.05,
              color: 'var(--fg)',
              marginBottom: '1.5rem',
            }}
          >
            Nsisong Effiong
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: 'var(--fg2)',
              lineHeight: 1.6,
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            Poet, engineer, essayist — writing at the intersection of
            language, technology, and public thought.
          </p>
        </section>

        {/* Section Cards */}
        <section
          style={{
            maxWidth: '1120px',
            margin: '0 auto 4rem',
            display: 'flex',
            borderTop: '1px solid var(--bdr)',
            borderBottom: '1px solid var(--bdr)',
            borderLeft: '1px solid var(--bdr)',
            flexWrap: 'wrap',
          }}
        >
          <SectionCard
            section="Poetry"
            title="Poetry"
            titleStyle={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: '2.2rem',
              color: 'var(--fg)',
            }}
            latest={{
              title: 'The Weight of Rivers',
              excerpt:
                'A meditation on water, memory, and the names we inherit from geography.',
            }}
            href="/poetry"
          />
          <SectionCard
            section="Tech"
            title="./tech"
            titleStyle={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontWeight: 400,
              fontSize: '2rem',
              color: 'var(--fg)',
            }}
            latest={{
              title: 'Building Resilient Edge Functions',
              excerpt:
                'Patterns for fault-tolerant serverless architectures at the edge.',
            }}
            href="/tech"
          />
          <SectionCard
            section="Ideas"
            title="Ideas"
            titleStyle={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: '2.2rem',
              color: 'var(--fg)',
            }}
            latest={{
              title: 'On the Architecture of Public Trust',
              excerpt:
                'How institutional design shapes — and erodes — democratic confidence.',
            }}
            href="/ideas"
          />
        </section>

        {/* Recent Posts Strip */}
        <section
          style={{
            maxWidth: '1120px',
            margin: '0 auto 6rem',
            padding: '0 2rem',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--fg2)',
              marginBottom: '1.5rem',
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
            {recentPosts.map((post) => {
              const sectionColor =
                post.section === 'Poetry'
                  ? 'var(--purple-acc)'
                  : post.section === 'Tech'
                    ? 'var(--teal-hero)'
                    : 'var(--amber)';
              return (
                <Link
                  key={post.href}
                  href={post.href}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    padding: '1.25rem 1.5rem',
                    borderLeft: `3px solid ${sectionColor}`,
                    background: 'var(--bg2)',
                    borderRadius: '2px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: sectionColor,
                      marginBottom: '0.4rem',
                    }}
                  >
                    {post.section}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-source-serif), serif',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: 'var(--fg)',
                      marginBottom: '0.3rem',
                    }}
                  >
                    {post.title}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.7rem',
                      color: 'var(--fg2)',
                    }}
                  >
                    {post.date}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid var(--bdr)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--fg2)',
            }}
          >
            © {new Date().getFullYear()} Nsisong Effiong. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
```

```tsx app/(public)/poetry/page.tsx
import SiteNav from '@/components/shared/SiteNav';
import Link from 'next/link';

const categories = [
  'All',
  'Nature & place',
  'Memory',
  'Language & form',
  'Grief',
  'Politics',
];

const featuredPoem = {
  title: 'The Weight of Rivers',
  excerpt:
    'A meditation on the names we carry from water — on how rivers remember what we choose to forget, and how their weight shifts the language of return.',
  verse:
    'The river does not ask\nfor the names we give it.\nIt carries them anyway —\nstone-smooth, moss-worn,\nuntranslatable.',
  date: 'April 12, 2026',
  category: 'Nature & place',
  href: '/poetry/the-weight-of-rivers',
};

const poems = [
  {
    title: 'Elegy with No Forwarding Address',
    excerpt:
      'On the insufficiency of letters sent to the departed, and the echo that fills the space where a name once lived.',
    date: 'March 28, 2026',
    category: 'Grief',
    href: '/poetry/elegy-no-forwarding-address',
  },
  {
    title: 'Syntax of Belonging',
    excerpt:
      'The grammar we invent to describe home — subject, predicate, the unparseable remainder of longing.',
    date: 'March 15, 2026',
    category: 'Language & form',
    href: '/poetry/syntax-of-belonging',
  },
  {
    title: 'Cartography of Silence',
    excerpt:
      'Mapping the territories we refuse to name. A study in negative space and political quiet.',
    date: 'February 22, 2026',
    category: 'Politics',
    href: '/poetry/cartography-of-silence',
  },
  {
    title: 'What the Baobab Holds',
    excerpt:
      'Root-memory, trunk-time. The tree as archive, its rings a chronicle of drought and deluge.',
    date: 'February 10, 2026',
    category: 'Nature & place',
    href: '/poetry/what-the-baobab-holds',
  },
  {
    title: 'Returning, Again',
    excerpt:
      'On the airport as threshold — neither here nor there, a liturgy of arrivals performed in reverse.',
    date: 'January 30, 2026',
    category: 'Memory',
    href: '/poetry/returning-again',
  },
  {
    title: 'The Declension of Light',
    excerpt:
      'Light conjugated through season: harmattan haze, equatorial noon, the subjunctive dusk of February.',
    date: 'January 18, 2026',
    category: 'Language & form',
    href: '/poetry/declension-of-light',
  },
];

export default function PoetryPage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* Hero */}
        <section
          style={{
            padding: '7rem 2rem 4rem',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(3.5rem, 8vw, 5rem)',
              lineHeight: 1.05,
              color: 'var(--fg)',
              marginBottom: '1rem',
            }}
          >
            Poetry
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '1.2rem',
              color: 'var(--fg2)',
              lineHeight: 1.6,
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            Verse at the edges of memory, landscape, and the politics of language.
          </p>
        </section>

        {/* Category Filter */}
        <nav
          style={{
            maxWidth: '800px',
            margin: '0 auto 3rem',
            padding: '0 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
        >
          {categories.map((cat, i) => (
            <button
              key={cat}
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '0.95rem',
                padding: '0.4rem 1.2rem',
                background: i === 0 ? 'var(--fg)' : 'transparent',
                color: i === 0 ? 'var(--bg)' : 'var(--fg2)',
                border: `1px solid ${i === 0 ? 'var(--fg)' : 'var(--bdr2)'}`,
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Featured Poem */}
        <section
          style={{
            maxWidth: '900px',
            margin: '0 auto 4rem',
            padding: '0 2rem',
          }}
        >
          <Link
            href={featuredPoem.href}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div
              style={{
                background: 'var(--bg2)',
                padding: '3rem',
                borderRadius: '2px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--purple-acc)',
                  marginBottom: '0.75rem',
                }}
              >
                Featured
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  fontSize: '2.2rem',
                  color: 'var(--fg)',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}
              >
                {featuredPoem.title}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: '1.05rem',
                  color: 'var(--fg2)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  maxWidth: '600px',
                }}
              >
                {featuredPoem.excerpt}
              </p>
              <div
                style={{
                  borderLeft: '2px solid var(--purple-acc)',
                  paddingLeft: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: '1.1rem',
                    color: 'var(--fg)',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {featuredPoem.verse}
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.7rem',
                    color: 'var(--fg2)',
                  }}
                >
                  {featuredPoem.date}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontSize: '0.85rem',
                    color: 'var(--purple-acc)',
                    border: '1px solid var(--purple-acc)',
                    padding: '0.2rem 0.7rem',
                    borderRadius: '999px',
                  }}
                >
                  {featuredPoem.category}
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Poem Card Grid */}
        <section
          style={{
            maxWidth: '900px',
            margin: '0 auto 6rem',
            padding: '0 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
          }}
        >
          {poems.map((poem) => (
            <Link
              key={poem.href}
              href={poem.href}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <article
                style={{
                  padding: '2rem 0',
                  borderTop: '1px solid var(--bdr)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontSize: '0.85rem',
                    color: 'var(--purple-acc)',
                    letterSpacing: '0.2em',
                    marginBottom: '0.75rem',
                  }}
                >
                  · · ·
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    fontSize: '1.5rem',
                    color: 'var(--fg)',
                    marginBottom: '0.6rem',
                    lineHeight: 1.2,
                  }}
                >
                  {poem.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: '0.95rem',
                    color: 'var(--fg2)',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                  }}
                >
                  {poem.excerpt}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.65rem',
                      color: 'var(--fg2)',
                    }}
                  >
                    {poem.date}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant), serif',
                      fontStyle: 'italic',
                      fontSize: '0.8rem',
                      color: 'var(--fg2)',
                      border: '1px solid var(--bdr2)',
                      padding: '0.15rem 0.6rem',
                      borderRadius: '999px',
                    }}
                  >
                    {poem.category}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid var(--bdr)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--fg2)',
            }}
          >
            © {new Date().getFullYear()} Nsisong Effiong. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
```

```tsx app/(public)/tech/page.tsx
import SiteNav from '@/components/shared/SiteNav';
import Link from 'next/link';

const filterChips = [
  'All',
  'Systems',
  'Edge Computing',
  'Databases',
  'DevOps',
  'Architecture',
  'TypeScript',
];

const articles = [
  {
    num: '01',
    title: 'Building Resilient Edge Functions',
    excerpt:
      'Patterns for fault-tolerant serverless architectures — retry strategies, circuit breakers, and graceful degradation at the edge.',
    date: '2026-04-10',
    readTime: '8 min',
    tags: ['Edge Computing', 'Architecture'],
    href: '/tech/resilient-edge-functions',
  },
  {
    num: '02',
    title: 'Drizzle ORM: Beyond the Basics',
    excerpt:
      'Advanced query composition, type-safe migrations, and performance patterns for production Drizzle applications.',
    date: '2026-03-25',
    readTime: '12 min',
    tags: ['Databases', 'TypeScript'],
    href: '/tech/drizzle-orm-advanced',
  },
  {
    num: '03',
    title: 'Zero-Downtime Deployments with Supabase',
    excerpt:
      'A practical guide to rolling migrations, connection pooling, and deployment strategies that keep your database online.',
    date: '2026-03-12',
    readTime: '10 min',
    tags: ['DevOps', 'Databases'],
    href: '/tech/zero-downtime-supabase',
  },
  {
    num: '04',
    title: 'Type-Safe API Contracts with tRPC',
    excerpt:
      'End-to-end type safety from database to UI — eliminating an entire class of runtime errors in full-stack TypeScript.',
    date: '2026-02-28',
    readTime: '7 min',
    tags: ['TypeScript', 'Architecture'],
    href: '/tech/type-safe-trpc',
  },
  {
    num: '05',
    title: 'Observability for Small Teams',
    excerpt:
      'Structured logging, distributed tracing, and alerting strategies that scale from side project to production without enterprise budgets.',
    date: '2026-02-15',
    readTime: '9 min',
    tags: ['DevOps', 'Systems'],
    href: '/tech/observability-small-teams',
  },
];

const tagPills = [
  'next.js',
  'supabase',
  'drizzle',
  'edge-functions',
  'typescript',
  'systems',
];

export default function TechPage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* Hero */}
        <section
          style={{
            background: 'var(--teal-hero)',
            padding: '6rem 2rem 4rem',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.8rem',
                color: '#9FE1CB',
                marginBottom: '0.75rem',
                opacity: 0.7,
              }}
            >
              {'# engineering blog'}
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontWeight: 400,
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                color: '#9FE1CB',
                marginBottom: '1rem',
                lineHeight: 1.1,
              }}
            >
              ./tech
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.95rem',
                color: '#9FE1CB',
                lineHeight: 1.7,
                maxWidth: '560px',
                marginBottom: '1.5rem',
                opacity: 0.85,
              }}
            >
              Notes on building things — systems design, edge computing,
              databases, and the craft of reliable software.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tagPills.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.7rem',
                    color: '#9FE1CB',
                    border: '1px solid #9FE1CB',
                    borderRadius: '999px',
                    padding: '0.25rem 0.75rem',
                    opacity: 0.6,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Chips */}
        <nav
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '2rem 2rem 1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {filterChips.map((chip, i) => (
            <button
              key={chip}
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.75rem',
                padding: '0.35rem 1rem',
                background: i === 0 ? 'var(--fg)' : 'transparent',
                color: i === 0 ? 'var(--bg)' : 'var(--fg2)',
                border: `1px solid ${i === 0 ? 'var(--fg)' : 'var(--bdr2)'}`,
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {chip}
            </button>
          ))}
        </nav>

        {/* Article List */}
        <section
          style={{
            maxWidth: '900px',
            margin: '1rem auto 3rem',
            padding: '0 2rem',
          }}
        >
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <article
                style={{
                  padding: '2rem 0',
                  borderBottom: '1px solid var(--bdr)',
                  display: 'grid',
                  gridTemplateColumns: '3.5rem 1fr',
                  gap: '1.5rem',
                  alignItems: 'start',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: 'var(--teal-hero)',
                    lineHeight: 1,
                    opacity: 0.4,
                  }}
                >
                  {article.num}
                </span>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '0.6rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: 'var(--teal-hero)',
                          border: '1px solid var(--bdr2)',
                          borderRadius: '2px',
                          padding: '0.15rem 0.5rem',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: 'var(--fg)',
                      marginBottom: '0.4rem',
                      lineHeight: 1.25,
                    }}
                  >
                    {article.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.85rem',
                      color: 'var(--fg2)',
                      lineHeight: 1.6,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {article.excerpt}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.7rem',
                      color: 'var(--fg2)',
                    }}
                  >
                    <span>{article.date}</span>
                    <span>{article.readTime} read</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>

        {/* Stats Bar */}
        <section
          style={{
            maxWidth: '900px',
            margin: '0 auto 6rem',
            padding: '0 2rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg2)',
              borderRadius: '2px',
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              textAlign: 'center',
              gap: '1rem',
            }}
          >
            {[
              { value: '12', label: 'articles published' },
              { value: '1,840', label: 'avg words' },
              { value: '6', label: 'topics covered' },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--teal-hero)',
                    lineHeight: 1,
                    marginBottom: '0.35rem',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.7rem',
                    color: 'var(--fg2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid var(--bdr)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--fg2)',
            }}
          >
            © {new Date().getFullYear()} Nsisong Effiong. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
```

```tsx app/(public)/ideas/page.tsx
import SiteNav from '@/components/shared/SiteNav';
import Link from 'next/link';

const topicChips = [
  'All',
  'Governance',
  'Technology & Society',
  'Education',
  'Urban Policy',
  'Democracy',
  'Climate',
];

const leadEssay = {
  kicker: 'Governance',
  title: 'On the Architecture of Public Trust',
  excerpt:
    'How institutional design shapes — and erodes — democratic confidence. A close reading of three frameworks for restoring civic faith in an age of compounding crises.',
  date: 'April 8, 2026',
  readTime: '14 min',
  href: '/ideas/architecture-of-public-trust',
};

const sidebarEssays = [
  {
    kicker: 'Education',
    title: 'The Curriculum as Territory',
    excerpt:
      'Who decides what a nation remembers? On the politics of syllabi.',
    date: 'March 30, 2026',
    readTime: '9 min',
    href: '/ideas/curriculum-as-territory',
  },
  {
    kicker: 'Technology & Society',
    title: 'Algorithmic Publics',
    excerpt:
      'When the town square is a feed, what constitutes assembly?',
    date: 'March 18, 2026',
    readTime: '11 min',
    href: '/ideas/algorithmic-publics',
  },
  {
    kicker: 'Urban Policy',
    title: 'Cities Without Centres',
    excerpt:
      'Polycentric urbanism and the end of the downtown paradigm.',
    date: 'March 5, 2026',
    readTime: '8 min',
    href: '/ideas/cities-without-centres',
  },
];

const pullQuote =
  '"The measure of a public institution is not its efficiency but its legibility — whether ordinary citizens can read the logic of its decisions and recognise themselves in its reasoning."';

const gridEssays = [
  {
    kicker: 'Democracy',
    title: 'Deliberation at Scale',
    excerpt:
      'Can democratic deliberation survive beyond the village? Lessons from citizen assemblies in Ireland, France, and Kenya.',
    date: 'Feb 22, 2026',
    readTime: '12 min',
    href: '/ideas/deliberation-at-scale',
  },
  {
    kicker: 'Climate',
    title: 'The Vocabulary of Adaptation',
    excerpt:
      'We lack the language for slow catastrophe. On building a rhetoric adequate to the climate crisis.',
    date: 'Feb 10, 2026',
    readTime: '10 min',
    href: '/ideas/vocabulary-of-adaptation',
  },
  {
    kicker: 'Governance',
    title: 'Bureaucracy as Craft',
    excerpt:
      'Against the caricature of the civil servant. Why competent administration is a democratic art form.',
    date: 'Jan 28, 2026',
    readTime: '9 min',
    href: '/ideas/bureaucracy-as-craft',
  },
  {
    kicker: 'Education',
    title: 'What Universities Owe',
    excerpt:
      'The debt runs both ways. On the social contract between higher education and the public that funds it.',
    date: 'Jan 15, 2026',
    readTime: '11 min',
    href: '/ideas/what-universities-owe',
  },
  {
    kicker: 'Technology & Society',
    title: 'Data as Commons',
    excerpt:
      'From extraction to stewardship: reimagining data governance through the lens of shared resources.',
    date: 'Jan 3, 2026',
    readTime: '13 min',
    href: '/ideas/data-as-commons',
  },
  {
    kicker: 'Urban Policy',
    title: 'The Right to Shade',
    excerpt:
      'Tree canopy as infrastructure. Why urban cooling is the next frontier of environmental justice.',
    date: 'Dec 20, 2025',
    readTime: '7 min',
    href: '/ideas/right-to-shade',
  },
];

export default function IdeasPage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* Masthead */}
        <section
          style={{
            padding: '7rem 2rem 3.5rem',
            maxWidth: '1120px',
            margin: '0 auto',
            borderBottom: '1px solid var(--bdr)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--fg2)',
              marginBottom: '0.75rem',
            }}
          >
            Essays · Policy · Public Thought
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(3.5rem, 8vw, 5rem)',
              color: 'var(--fg)',
              lineHeight: 1.05,
              marginBottom: '0.75rem',
            }}
          >
            Ideas
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontSize: '1rem',
              color: 'var(--fg2)',
              fontStyle: 'italic',
            }}
          >
            Vol. I · April 2026
          </p>
        </section>

        {/* Top Grid: Lead + Sidebar */}
        <section
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '3rem 2rem',
            display: 'grid',
            gridTemplateColumns: '2fr 1px 1fr',
            gap: '2.5rem',
          }}
        >
          {/* Lead Essay */}
          <Link
            href={leadEssay.href}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <article>
              <p
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--amber)',
                  marginBottom: '0.75rem',
                }}
              >
                {leadEssay.kicker}
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: 'var(--fg)',
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                }}
              >
                {leadEssay.title}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontSize: '1.05rem',
                  color: 'var(--fg2)',
                  lineHeight: 1.7,
                  marginBottom: '1rem',
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
                  color: 'var(--fg2)',
                }}
              >
                <span>{leadEssay.date}</span>
                <span>{leadEssay.readTime} read</span>
              </div>
            </article>
          </Link>

          {/* Vertical Divider */}
          <div style={{ background: 'var(--bdr)', width: '1px' }} />

          {/* Sidebar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}
          >
            {sidebarEssays.map((essay, i) => (
              <Link
                key={essay.href}
                href={essay.href}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <article
                  style={{
                    padding: '1.25rem 0',
                    borderBottom:
                      i < sidebarEssays.length - 1
                        ? '1px solid var(--bdr)'
                        : 'none',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 600,
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--amber)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {essay.kicker}
                  </p>
                  <h3
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--fg)',
                      lineHeight: 1.25,
                      marginBottom: '0.3rem',
                    }}
                  >
                    {essay.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-source-serif), serif',
                      fontSize: '0.85rem',
                      color: 'var(--fg2)',
                      lineHeight: 1.5,
                      marginBottom: '0.4rem',
                    }}
                  >
                    {essay.excerpt}
                  </p>
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.65rem',
                      color: 'var(--fg2)',
                    }}
                  >
                    {essay.readTime} read
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Pull Quote Strip */}
        <section
          style={{
            background: 'var(--amber-pq)',
            padding: '3.5rem 2rem',
            margin: '1rem 0',
          }}
        >
          <blockquote
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              fontFamily: 'var(--font-source-serif), serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
              lineHeight: 1.6,
              color: 'var(--fg)',
              textAlign: 'center',
            }}
          >
            {pullQuote}
          </blockquote>
        </section>

        {/* Topic Filter */}
        <nav
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '2.5rem 2rem 1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {topicChips.map((chip, i) => (
            <button
              key={chip}
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '0.35rem 1rem',
                background: i === 0 ? 'var(--fg)' : 'transparent',
                color: i === 0 ? 'var(--bg)' : 'var(--fg2)',
                border: `1px solid ${i === 0 ? 'var(--fg)' : 'var(--bdr2)'}`,
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {chip}
            </button>
          ))}
        </nav>

        {/* Essay Grid */}
        <section
          style={{
            maxWidth: '1120px',
            margin: '1rem auto 6rem',
            padding: '0 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {gridEssays.map((essay) => (
            <Link
              key={essay.href}
              href={essay.href}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <article
                style={{
                  padding: '1.75rem 0',
                  borderTop: '1px solid var(--bdr)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--amber)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {essay.kicker}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    color: 'var(--fg)',
                    lineHeight: 1.25,
                    marginBottom: '0.5rem',
                  }}
                >
                  {essay.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-source-serif), serif',
                    fontSize: '0.9rem',
                    color: 'var(--fg2)',
                    lineHeight: 1.6,
                    marginBottom: '0.85rem',
                  }}
                >
                  {essay.excerpt}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    color: 'var(--fg2)',
                  }}
                >
                  <span>{essay.date}</span>
                  <span>{essay.readTime} read</span>
                </div>
              </article>
            </Link>
          ))}
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid var(--bdr)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--fg2)',
            }}
          >
            © {new Date().getFullYear()} Nsisong Effiong. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
```