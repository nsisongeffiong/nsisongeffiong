import SiteNav from '@/components/shared/SiteNav';

const categories = [
  'All',
  'Nature & place',
  'Memory',
  'Language & form',
  'Grief',
  'Politics',
];

const featuredPoem = {
  title: 'The River Remembers',
  excerpt:
    'A meditation on how water holds the stories we drop into it — the baptisms, the crossings, the names spoken once and carried downstream forever.',
  verse: `The river remembers what the mouth forgets—\nhow your name tasted before the renaming,\nhow the current held you\nthe way a vowel holds breath\nbefore it breaks into song.`,
  category: 'Memory',
  date: '2024-12-15',
};

const poems = [
  {
    title: 'Cartography of Silence',
    excerpt:
      'Where the map ends, the body begins — tracing the borders that no surveyor drew.',
    date: '2024-11-28',
    category: 'Nature & place',
  },
  {
    title: 'After the Rains',
    excerpt:
      'What remains when the storm has spoken — the grammar of wet earth and unfinished prayer.',
    date: '2024-11-10',
    category: 'Grief',
  },
  {
    title: 'Syntax of Return',
    excerpt:
      'A poem about coming home to a language that no longer fits the mouth that left.',
    date: '2024-10-22',
    category: 'Language & form',
  },
  {
    title: 'The Weight of Provinces',
    excerpt:
      'On borders drawn with rulers on tables far from the land they divided.',
    date: '2024-10-05',
    category: 'Politics',
  },
];

export default function PoetryPage() {
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
          padding: '5rem 1.5rem 3rem',
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(3rem, 7vw, 5rem)',
            lineHeight: 1.05,
            color: 'var(--txt)',
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
            fontSize: '1.15rem',
            color: 'var(--txt-secondary)',
            lineHeight: 1.6,
          }}
        >
          Verses on memory, landscape, and the silence between words — each poem
          a small act of naming.
        </p>
      </section>

      {/* ── Category Filter ── */}
      <nav
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '0 1.5rem 2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {categories.map((cat, i) => (
          <button
            key={cat}
            type="button"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: i === 0 ? 'var(--purple-acc)' : 'transparent',
              color: i === 0 ? 'var(--bg)' : 'var(--txt-secondary)',
              border:
                i === 0
                  ? '1px solid var(--purple-acc)'
                  : '1px solid var(--bdr)',
              borderRadius: '2px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* ── Featured Poem ── */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg2)',
            padding: '2.5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2.5rem',
          }}
        >
          {/* Left: Title & excerpt */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--purple-acc)',
              }}
            >
              Featured
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '2rem',
                lineHeight: 1.15,
                color: 'var(--txt)',
              }}
            >
              {featuredPoem.title}
            </h2>
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
              {featuredPoem.excerpt}
            </p>
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--purple-acc)',
                border: '1px solid var(--purple-acc)',
                padding: '0.15rem 0.5rem',
                borderRadius: '2px',
                alignSelf: 'flex-start',
              }}
            >
              {featuredPoem.category}
            </span>
          </div>

          {/* Right: Verse excerpt */}
          <div
            style={{
              borderLeft: '3px solid var(--purple-acc)',
              paddingLeft: '1.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '1.1rem',
                lineHeight: 1.9,
                color: 'var(--txt)',
                whiteSpace: 'pre-line',
              }}
            >
              {featuredPoem.verse}
            </p>
          </div>
        </div>
      </section>

      {/* ── Poem Card Grid ── */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 1.5rem 5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {poems.map((poem) => (
          <article
            key={poem.title}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingBottom: '2rem',
              borderBottom: '0.5px solid var(--bdr)',
            }}
          >
            {/* Ornamental dots */}
            <span
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '1rem',
                letterSpacing: '0.5em',
                color: 'var(--purple-acc)',
                userSelect: 'none',
              }}
              aria-hidden="true"
            >
              · · ·
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '1.5rem',
                lineHeight: 1.2,
                color: 'var(--txt)',
              }}
            >
              <a
                href={`/poetry/${poem.title.toLowerCase().replace(/ /g, '-')}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {poem.title}
              </a>
            </h3>
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
              {poem.excerpt}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
              }}
            >
              <time
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  color: 'var(--txt-secondary)',
                }}
                dateTime={poem.date}
              >
                {new Date(poem.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--purple-acc)',
                  border: '1px solid var(--purple-acc)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '2px',
                }}
              >
                {poem.category}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
