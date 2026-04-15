## A. Triage of All Findings

### GPT Review Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | Admin-only write not enforced on `POST /api/posts` | **ESCALATE** | Critical security issue but requires product decision on admin identity strategy (email allowlist, custom claims, or RLS). Cannot implement without knowing the approach. |
| 2 | Disqus reinit fails on client-side navigation | **ACCEPT** | Real bug — `DISQUS.reset()` should be called when already loaded instead of appending a new script. |
| 3 | `var(--txt-secondary)` undefined on `page.tsx` (landing) | **ACCEPT** | Token doesn't exist in globals.css. Will add semantic aliases. |
| 4 | `var(--txt-secondary)` undefined on `poetry/page.tsx` | **ACCEPT** | Same issue. |
| 5 | `var(--txt-secondary)` undefined on `tech/page.tsx` | **ACCEPT** | Same issue. |
| 6 | `var(--txt-secondary)` undefined on `ideas/page.tsx` | **ACCEPT** | Same issue. |
| 7 | Turnstile token never set — comments always fail | **ACCEPT** | Add a client-side guard with user-friendly error (already partially present but needs verification the guard works). Reviewing code — the guard IS present. No change needed to CommentForm. |
| 8 | SiteNav active-link logic brittle for root path `/` | **REJECT** | Current NAV_LINKS don't include `/` — finding is speculative. Low risk. |
| 9 | `next lint` brittle with ESLint 9 | **REJECT** | Low priority, not a merge blocker. |
| 10 | `src/generated.py` should be deleted | **ESCALATE** | File deletion requires human confirmation. |
| 11 | `src/index.js` should be deleted | **ESCALATE** | May be required by external tooling. |

### Gemini Review Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | Broken Access Control — unrestricted post creation | **ESCALATE** | Same as GPT #1. |

### Previous Final Review Errors (from `reviews/final-review.md`)

The previous review's corrected files section is mostly fine but I need to verify each change against the actual source:

| Item | Decision | Rationale |
|------|----------|-----------|
| `--danger` variable already in globals.css | **REJECT change** | Already present in source. No modification needed. |
| CommentForm `var(--danger)` usage | **REJECT change** | Already uses `var(--danger)` in source. No change needed. |
| Admin TODO comment | **REJECT change** | Already present in source code with proper comments. |

---

## B. Corrected Files

After careful review, the files that actually need changes are:

1. **`app/globals.css`** — Add `--txt-secondary` semantic alias
2. **`components/shared/DisqusComments.tsx`** — Fix Disqus reinit on navigation
3. **`app/(public)/page.tsx`** — Replace `var(--txt-secondary)` with `var(--txt2)` (belt-and-suspenders with alias)
4. **`app/(public)/poetry/page.tsx`** — Same
5. **`app/(public)/tech/page.tsx`** — Same
6. **`app/(public)/ideas/page.tsx`** — Same

I'll add the semantic alias in globals.css AND fix the component references to use the canonical token, making the alias a safety net.

```css app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Light mode tokens ──────────────────────────────────────────────────────── */
:root {
  --bg:          #F7F5F0;
  --bg2:         #EEEAE0;
  --bg3:         #E5E0D4;
  --txt:         #1C1C18;
  --txt2:        #5C5B54;
  --txt3:        #9C9B90;
  --bdr:         rgba(28, 28, 24, 0.1);
  --bdr2:        rgba(28, 28, 24, 0.2);

  /* Semantic aliases */
  --txt-secondary: var(--txt2);
  --txt-tertiary:  var(--txt3);

  /* Poetry — purple */
  --purple:      #534AB7;
  --purple-bg:   #EEEDFE;
  --purple-txt:  #3C3489;
  --purple-acc:  #AFA9EC;

  /* Tech — teal */
  --teal-hero:   #04342C;
  --teal-mid:    #1D9E75;
  --teal-light:  #5DCAA5;
  --teal-pale:   #E1F5EE;
  --teal-txt:    #085041;
  --teal-comm:   #0F6E56;

  /* Ideas — amber */
  --amber:       #BA7517;
  --amber-bg:    #FDF6E8;
  --amber-txt:   #7A4A0A;
  --amber-pq:    #FDF0D4;
  --amber-pq-txt:#5C3608;

  /* Semantic */
  --danger:      #E24B4A;
}

/* ─── Dark mode tokens ───────────────────────────────────────────────────────── */
.dark {
  --bg:          #0E0E0C;
  --bg2:         #181815;
  --bg3:         #1E1E1A;
  --txt:         #F0EFE8;
  --txt2:        #A8A89E;
  --txt3:        #606058;
  --bdr:         rgba(240, 239, 232, 0.1);
  --bdr2:        rgba(240, 239, 232, 0.2);

  --purple:      #AFA9EC;
  --purple-bg:   #26215C;
  --purple-txt:  #CECBF6;
  --purple-acc:  #7F77DD;

  --teal-hero:   #021F1A;
  --teal-mid:    #5DCAA5;
  --teal-light:  #9FE1CB;
  --teal-pale:   #085041;
  --teal-txt:    #9FE1CB;
  --teal-comm:   #0F6E56;

  --amber:       #EF9F27;
  --amber-bg:    #2C1D06;
  --amber-txt:   #FAC775;
  --amber-pq:    #2C1D06;
  --amber-pq-txt:#FAC775;

  --danger:      #FF7B72;
}

/* ─── Base styles ────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background-color: var(--bg);
  color: var(--txt);
}

body {
  background-color: var(--bg);
  color: var(--txt);
  font-family: var(--font-syne), sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── Tiptap editor base ─────────────────────────────────────────────────────── */
.tiptap {
  outline: none;
  font-family: var(--font-source-serif), serif;
  font-size: 17px;
  line-height: 1.9;
  color: var(--txt2);
}

.tiptap p { margin-bottom: 1.4rem; }
.tiptap h2 {
  font-family: var(--font-syne), sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 2.5rem 0 0.85rem;
  color: var(--txt);
}
.tiptap h3 {
  font-family: var(--font-syne), sans-serif;
  font-size: 17px;
  font-weight: 600;
  margin: 2rem 0 0.75rem;
  color: var(--txt);
}
.tiptap pre {
  font-family: var(--font-dm-mono), monospace;
  font-size: 12px;
  background: var(--teal-hero);
  color: #9FE1CB;
  padding: 1.25rem 1.5rem;
  border-radius: 4px;
  margin: 1.5rem 0;
  overflow-x: auto;
  line-height: 1.85;
}
.tiptap blockquote {
  border-top: 2.5px solid var(--amber);
  padding: 1rem 0 1rem 1.25rem;
  margin: 2rem 0;
  font-style: italic;
  color: var(--txt2);
}
.tiptap a { color: var(--amber); text-decoration: underline; }

/* ─── Focus ring ─────────────────────────────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--purple);
  outline-offset: 2px;
}
```

```tsx components/shared/DisqusComments.tsx
'use client'

import { useEffect } from 'react'

interface DisqusCommentsProps {
  slug:  string
  title: string
  path:  string  // full canonical path e.g. /poetry/the-plea
}

export function DisqusComments({ slug, title, path }: DisqusCommentsProps) {
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
  const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME ?? 'nsisongeffiong'

  useEffect(() => {
    const win = window as any

    const config = function (this: any) {
      this.page.url        = `${siteUrl}${path}`
      this.page.identifier = slug
      this.page.title      = title
    }

    win.disqus_config = config

    // If DISQUS is already loaded (e.g. navigating between posts),
    // call reset instead of appending a new script
    if (win.DISQUS) {
      win.DISQUS.reset({
        reload: true,
        config,
      })
      return
    }

    const script    = document.createElement('script')
    script.src      = `https://${shortname}.disqus.com/embed.js`
    script.async    = true
    script.setAttribute('data-timestamp', String(+new Date()))
    document.body.appendChild(script)

    return () => {
      // Clean up the embed when navigating away
      const thread = document.getElementById('disqus_thread')
      if (thread) thread.innerHTML = ''
    }
  }, [slug, title, path, siteUrl, shortname])

  return (
    <div style={{ padding: '2.5rem 2rem' }}>
      <div
        style={{
          width:        '100%',
          height:       '0.5px',
          background:   'var(--bdr)',
          marginBottom: '2rem',
        }}
      />
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '0.75rem',
          marginBottom:  '1.5rem',
        }}
      >
        <span
          style={{
            fontFamily:    'var(--font-cormorant), serif',
            fontSize:      '12px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color:         'var(--txt3)',
          }}
        >
          Responses
        </span>
        <span
          style={{
            fontFamily:  'var(--font-dm-mono), monospace',
            fontSize:    '9px',
            padding:     '2px 7px',
            background:  'var(--purple-bg)',
            color:       'var(--purple-txt)',
            borderRadius:'2px',
            letterSpacing:'0.08em',
          }}
        >
          via Disqus
        </span>
      </div>
      <div id="disqus_thread" />
    </div>
  )
}
```

```tsx app/(public)/page.tsx
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
            color: 'var(--txt2)',
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
              color: 'var(--txt2)',
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
                color: 'var(--txt2)',
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
              color: 'var(--txt2)',
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
                color: 'var(--txt2)',
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
              color: 'var(--txt2)',
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
                color: 'var(--txt2)',
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
            color: 'var(--txt2)',
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
                  color: 'var(--txt2)',
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
            color: 'var(--txt2)',
          }}
        >
          © {new Date().getFullYear()} Nsisong Effiong. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
```

```tsx app/(public)/poetry/page.tsx
import { SiteNav } from '@/components/shared/SiteNav';

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
            color: 'var(--txt2)',
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
              color: i === 0 ? 'var(--bg)' : 'var(--txt2)',
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
                color: 'var(--txt2)',
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
                color: 'var(--txt2)',
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
                  color: 'var(--txt2)',
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
```

```tsx app/(public)/tech/page.tsx
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
              color: i === 0 ? 'var(--teal-mid)' : 'var(--txt2)',
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
                  color: 'var(--txt2)',
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
                  color: 'var(--txt2)',
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
                  color: 'var(--txt2)',
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
```

```tsx app/(public)/ideas/page.tsx
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
              color: 'var(--txt2)',
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
              color: 'var(--txt2)',
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
              color: 'var(--txt2)',
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
                  color: 'var(--txt2)',
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
              color: 'var(--txt2)',
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
              color: i === 0 ? 'var(--bg)' : 'var(--txt2)',
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
          maxWidth: '1