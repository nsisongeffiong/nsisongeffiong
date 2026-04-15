Looking at the full source code alongside both reviews, I need to carefully triage every finding, apply accepted changes, and produce the final review.

## A. Triage of All Findings

### GPT Review Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| G1 | Admin-only post creation not enforced | **ESCALATE** | Critical security. Both reviewers flagged. Requires product decision on admin identity strategy. |
| G2 | `window.turnstileToken` — no Turnstile widget rendered | **REJECT** | Known incomplete integration. The guard works correctly. Turnstile widget will be added when the feature is fully implemented. The `declare global` is already present in source. |
| G3 | Hardcoded `#E1F5EE` in tech/[slug] hero title | **ACCEPT** | Violates brand rule "Never use hardcoded hex values." `#E1F5EE` matches `--teal-pale` in light mode. Should use `var(--teal-pale)`. |
| G4 | Hardcoded `#9FE1CB` in tech/[slug] code blocks | **REJECT** | Per CONTEXT.md Tech section rules: "code blocks in dark green" and `prompts/claude_coder.md` explicitly says "colour `#9FE1CB`" for Tech submit button and code. This is an intentional brand decision for the teal-hero background context where CSS variables would resolve to wrong values in dark mode. The hero background is always `--teal-hero`, and the text on it needs to be the specific light teal. |
| G5 | `app/globals.css` `.tiptap pre` uses `color: #9FE1CB` | **REJECT** | Same rationale as G4. Tiptap code blocks use `--teal-hero` background with `#9FE1CB` text — this is the Tech section's fixed code block styling, matching brand spec. |
| G6 | `var(--color-text-danger)` undefined in admin login | **ACCEPT** | Clear bug. `--color-text-danger` is not defined. `--danger` is. |
| G7 | `/about` nav link is dead | **ACCEPT** | Dead link harms UX. Remove until route exists. |
| G8 | `next lint` incompatibility with ESLint 9 | **REJECT** | Low priority, not a merge blocker. Works in current setup. |
| G9 | `next@15.0.0` has security vulnerability | **ESCALATE** | Package upgrade requires testing. Not a code change. |
| G10 | De-duplicate local `slugify` in tech/[slug] | **ACCEPT** | Good hygiene. Avoids divergent slug behavior. |
| G11 | Replace `window.turnstileToken` with component state + widget | **REJECT** | Premature. Turnstile integration is explicitly marked as incomplete. Current architecture allows external script injection. |

### Gemini Review Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| Gem1 | Broken Access Control on POST /api/posts | **ESCALATE** | Same as G1. |

### Previous Final Review Findings (from `reviews/final-review.md`)

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| P1 | Turnstile sends JSON instead of form-encoded | **ACCEPT** | Looking at actual source code, `verifyTurnstile` already uses `URLSearchParams` with `application/x-www-form-urlencoded`. This was already correct. No change needed. |
| P2 | RSS CDATA `]]>` escaping | **ACCEPT** | Already implemented in source with `toCdataSafe`. No change needed. |
| P3 | Migration script exit code | **ACCEPT** | Already implemented in source with `process.exit(failed > 0 ? 1 : 0)`. No change needed. |
| P4 | Typed `window.turnstileToken` | **ACCEPT** | Already has `declare global` in source. No change needed. |

So the previous review already applied several fixes that are present in the current source. The remaining actionable items are:

1. **G3** — Hardcoded `#E1F5EE` → `var(--teal-pale)` in tech hero title
2. **G6** — `var(--color-text-danger)` → `var(--danger)` in admin login
3. **G7** — Remove `/about` from NAV_LINKS
4. **G10** — Replace local `slugify` with `generateSlug` import

## B. Corrected Files

```tsx app/(public)/tech/[slug]/page.tsx
import { SiteNav } from '@/components/shared/SiteNav';
import { CommentForm } from '@/components/shared/CommentForm';
import { generateSlug } from '@/lib/utils';

/* ── static placeholder data ── */
const post = {
  id: 'placeholder-id',
  slug: 'building-a-comment-system-with-drizzle-and-supabase',
  title: 'Building a Comment System with Drizzle & Supabase',
  description: 'A walkthrough of the moderation pipeline, honeypot fields, and Turnstile integration for a spam-free comment system.',
  tags: ['Drizzle', 'Supabase', 'Next.js', 'TypeScript'],
  author: 'Nsisong Effiong',
  date: '28 Feb 2024',
  readTime: '8 min read',
  body: [
    {
      type: 'paragraph' as const,
      text: 'The comment system for this site needed to balance simplicity with resilience. I wanted no client-side JavaScript dependencies for rendering comments, server-side moderation by default, and strong spam prevention without CAPTCHAs.',
    },
    {
      type: 'heading' as const,
      text: 'Schema Design',
    },
    {
      type: 'paragraph' as const,
      text: 'Every comment is stored with a status field that defaults to pending. Only approved comments are returned in public queries. The schema uses Drizzle ORM with a PostgreSQL backend on Supabase.',
    },
    {
      type: 'code' as const,
      language: 'typescript',
      text: `export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postSlug: varchar('post_slug', { length: 255 }).notNull(),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  body: text('body').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});`,
    },
    {
      type: 'heading' as const,
      text: 'Honeypot Fields',
    },
    {
      type: 'paragraph' as const,
      text: 'A hidden field named website is included in the form. Bots that fill it in receive a fake success response. The server never writes their data to the database.',
    },
    {
      type: 'callout' as const,
      label: '// note',
      text: 'The honeypot check runs before Turnstile verification to save API calls on obvious bot submissions.',
    },
    {
      type: 'heading' as const,
      text: 'Turnstile Integration',
    },
    {
      type: 'paragraph' as const,
      text: 'After the honeypot check passes, the server verifies the Cloudflare Turnstile token. Only then does the comment get written to the database with pending status.',
    },
  ],
  toc: [
    { id: 'schema-design', label: 'Schema Design' },
    { id: 'honeypot-fields', label: 'Honeypot Fields' },
    { id: 'turnstile-integration', label: 'Turnstile Integration' },
  ],
  related: [
    { slug: 'drizzle-orm-patterns', title: 'Drizzle ORM Patterns' },
    { slug: 'nextjs-middleware-auth', title: 'Next.js Middleware Auth' },
  ],
  commentCount: 5,
};

const prevPost = {
  slug: 'drizzle-orm-patterns',
  title: 'Drizzle ORM Patterns',
};

const nextPost = {
  slug: 'nextjs-middleware-auth',
  title: 'Next.js Middleware Auth',
};

const comments: Array<{
  id: string;
  name: string;
  initials: string;
  date: string;
  body: string;
  replies: Array<{
    id: string;
    name: string;
    initials: string;
    date: string;
    body: string;
  }>;
}> = [
  {
    id: '1',
    name: 'Chidi Anagonye',
    initials: 'CA',
    date: '01 Mar 2024',
    body: 'Clean approach. Have you considered adding rate limiting per IP as an additional layer before the Turnstile check?',
    replies: [
      {
        id: '1a',
        name: 'Nsisong Effiong',
        initials: 'NE',
        date: '01 Mar 2024',
        body: 'Yes — that is on the roadmap. Vercel edge middleware makes it straightforward with the @vercel/kv rate limiter.',
      },
    ],
  },
  {
    id: '2',
    name: 'Amaka Obi',
    initials: 'AO',
    date: '03 Mar 2024',
    body: 'The fake success response for honeypot hits is clever. Bots never learn they have been caught.',
    replies: [],
  },
];

export default function TechSinglePage() {
  return (
    <>
      <SiteNav />

      <main
        style={{
          color: 'var(--txt)',
          background: 'var(--bg)',
          minHeight: '100vh',
        }}
      >
        {/* ── back link / breadcrumb ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 960,
            margin: '0 auto',
            padding: '1.5rem 2rem 0',
          }}
        >
          <a
            href="/tech"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.8rem',
              color: 'var(--txt2)',
              textDecoration: 'none',
            }}
          >
            ← ~/tech
          </a>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--teal-mid)',
              maxWidth: '60%',
              textAlign: 'right',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.title}
          </span>
        </div>

        {/* ── hero ── */}
        <div
          style={{
            background: 'var(--teal-hero)',
            padding: '2.5rem 2rem',
            marginTop: '1rem',
          }}
        >
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            {/* tags */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.04em',
                    color: 'var(--teal-comm)',
                    border: '1px solid var(--teal-comm)',
                    borderRadius: 3,
                    padding: '0.2rem 0.55rem',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* title */}
            <h1
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 700,
                fontSize: '2.125rem',
                lineHeight: 1.2,
                color: 'var(--teal-pale)',
                margin: '0 0 0.75rem',
              }}
            >
              {post.title}
            </h1>

            {/* description */}
            <p
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--teal-light)',
                margin: '0 0 1.25rem',
                maxWidth: 640,
              }}
            >
              {post.description}
            </p>

            {/* meta row */}
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                color: 'var(--teal-comm)',
                display: 'flex',
                gap: '1.25rem',
              }}
            >
              <span>{post.date}</span>
              <span>{post.readTime}</span>
              <span>{post.author}</span>
            </div>
          </div>
        </div>

        {/* ── two-column body ── */}
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '2.5rem 2rem',
            display: 'flex',
            gap: '2.5rem',
            alignItems: 'flex-start',
          }}
        >
          {/* article column */}
          <article style={{ flex: 1, minWidth: 0 }}>
            {post.body.map((block, i) => {
              if (block.type === 'heading') {
                const id = generateSlug(block.text);
                return (
                  <h2
                    key={i}
                    id={id}
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      color: 'var(--txt)',
                      margin: '2rem 0 0.75rem',
                    }}
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'paragraph') {
                return (
                  <p
                    key={i}
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontSize: '0.875rem',
                      lineHeight: 1.8,
                      color: 'var(--txt2)',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    {block.text}
                  </p>
                );
              }

              if (block.type === 'code') {
                return (
                  <pre
                    key={i}
                    style={{
                      background: 'var(--teal-hero)',
                      color: 'var(--teal-light)',
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.6875rem',
                      lineHeight: 1.7,
                      padding: '1.25rem 1.5rem',
                      borderRadius: 4,
                      overflow: 'auto',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    <code>{block.text}</code>
                  </pre>
                );
              }

              if (block.type === 'callout') {
                return (
                  <div
                    key={i}
                    style={{
                      borderLeft: '3px solid var(--teal-mid)',
                      background: 'var(--bg2)',
                      padding: '1rem 1.25rem',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '0.65rem',
                        color: 'var(--teal-mid)',
                        display: 'block',
                        marginBottom: '0.35rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {block.label}
                    </span>
                    <p
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '0.8rem',
                        lineHeight: 1.65,
                        color: 'var(--txt2)',
                        margin: 0,
                      }}
                    >
                      {block.text}
                    </p>
                  </div>
                );
              }

              return null;
            })}
          </article>

          {/* sidebar */}
          <aside
            style={{
              width: 185,
              flexShrink: 0,
              position: 'sticky',
              top: '2rem',
            }}
          >
            {/* ToC */}
            <div
              style={{
                background: 'var(--bg2)',
                padding: '1rem',
                marginBottom: '1.5rem',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--txt3)',
                  display: 'block',
                  marginBottom: '0.75rem',
                }}
              >
                // contents
              </span>
              <nav>
                {post.toc.map((item, idx) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.7rem',
                      lineHeight: 1.5,
                      color: idx === 0 ? 'var(--teal-mid)' : 'var(--txt2)',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* related posts */}
            <div
              style={{
                background: 'var(--bg2)',
                padding: '1rem',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--txt3)',
                  display: 'block',
                  marginBottom: '0.75rem',
                }}
              >
                // related
              </span>
              {post.related.map((rel) => (
                <a
                  key={rel.slug}
                  href={`/tech/${rel.slug}`}
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.7rem',
                    lineHeight: 1.5,
                    color: 'var(--teal-mid)',
                    textDecoration: 'none',
                    display: 'block',
                    marginBottom: '0.4rem',
                  }}
                >
                  {rel.title}
                </a>
              ))}
            </div>
          </aside>
        </div>

        {/* ── prev / next footer ── */}
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '0 2rem',
          }}
        >
          <div
            style={{
              borderTop: '0.5px solid var(--bdr)',
              padding: '1.5rem 0',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {prevPost ? (
              <a
                href={`/tech/${prevPost.slug}`}
                style={{
                  textDecoration: 'none',
                  maxWidth: '45%',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--txt3)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  ← prev
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.8rem',
                    color: 'var(--txt2)',
                  }}
                >
                  {prevPost.title}
                </span>
              </a>
            ) : (
              <span />
            )}
            {nextPost ? (
              <a
                href={`/tech/${nextPost.slug}`}
                style={{
                  textDecoration: 'none',
                  textAlign: 'right',
                  maxWidth: '45%',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--txt3)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  next →
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.8rem',
                    color: 'var(--teal-mid)',
                  }}
                >
                  {nextPost.title}
                </span>
              </a>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* ── comments section ── */}
        <section
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '0 2rem 4rem',
          }}
        >
          {/* discussion header */}
          <div
            style={{
              borderTop: '0.5px solid var(--bdr)',
              paddingTop: '1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                color: 'var(--teal-mid)',
                letterSpacing: '0.04em',
              }}
            >
              // discussion
            </span>
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.65rem',
                color: 'var(--txt3)',
              }}
            >
              {post.commentCount} responses
            </span>
          </div>

          {/* comments list */}
          <div style={{ marginBottom: '2.5rem' }}>
            {comments.map((comment) => (
              <div key={comment.id} style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.4rem',
                  }}
                >
                  {/* square avatar */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      background: 'var(--teal-pale)',
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      color: 'var(--teal-hero)',
                      borderRadius: 3,
                    }}
                  >
                    {comment.initials}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: 'var(--txt)',
                    }}
                  >
                    {comment.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.6rem',
                      color: 'var(--txt3)',
                    }}
                  >
                    {comment.date}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontSize: '0.85rem',
                    lineHeight: 1.7,
                    color: 'var(--txt2)',
                    margin: '0 0 0 calc(28px + 0.75rem)',
                  }}
                >
                  {comment.body}
                </p>

                {/* replies */}
                {comment.replies.length > 0 && (
                  <div
                    style={{
                      marginTop: '1rem',
                      marginLeft: 'calc(28px + 0.75rem)',
                    }}
                  >
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        style={{
                          borderLeft: '2px solid var(--teal-mid)',
                          paddingLeft: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.35rem',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 24,
                              height: 24,
                              background: 'var(--teal-pale)',
                              fontFamily: 'var(--font-dm-mono), monospace',
                              fontSize: '0.5rem',
                              fontWeight: 700,
                              color: 'var(--teal-hero)',
                              borderRadius: 3,
                            }}
                          >
                            {reply.initials}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-syne), sans-serif',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              color: 'var(--txt)',
                            }}
                          >
                            {reply.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-dm-mono), monospace',
                              fontSize: '0.55rem',
                              color: 'var(--txt3)',
                            }}
                          >
                            {reply.date}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: 'var(--font-syne), sans-serif',
                            fontSize: '0.8rem',
                            lineHeight: 1.7,
                            color: 'var(--txt2)',
                            margin: 0,
                          }}
                        >
                          {reply.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* comment form */}
          <CommentForm postId={post.id} section="tech" />
        </section>
      </main>
    </>
  );
}
```

```tsx app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.success === true) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg2)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg)',
          border: '0.5px solid var(--bdr)',
          borderRadius: '4px',
          padding: '2.5rem',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '20px',
            fontStyle: 'italic',
            color: 'var(--txt)',
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          nsisongeffiong.com
        </a>

        <span
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--txt3)',
            display: 'block',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          Admin
        </span>

        <hr
          style={{
            width: '100%',
            height: '0.5px',
            background: 'var(--bdr)',
            marginBottom: '1.5rem',
            border: 'none',
          }}
        />

        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="email"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '13px',
              padding: '0.6rem 0.75rem',
              border: '0.5px solid var(--bdr2)',
              borderRadius: '3px',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="password"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '13px',
              padding: '0.6rem 0.75rem',
              border: '0.5px solid var(--bdr2)',
              borderRadius: '3px',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              color: 'var(--danger)',
              marginBottom: '1rem',
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            background: 'var(--teal-hero)',
            color: 'var(--teal-light)',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '3px',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
```

```ts types/index.ts
import type { Post, Comment, PostMetadata } from '@/lib/db/schema'

// ─── Re-export DB types ───────────────────────────────────────────────────────
export type { Post, Comment, PostMetadata }

// ─── Post type literals ───────────────────────────────────────────────────────
export type PostType = 'poetry' | 'tech' | 'ideas'

// ─── Post with computed fields ────────────────────────────────────────────────
export type PostWithMeta = Post & {
  readTime?: number
  commentCount?: number
}

// ─── Comment status ───────────────────────────────────────────────────────────
export type CommentStatus = 'pending' | 'approved' | 'rejected'

// ─── Comment submission form data ────────────────────────────────────────────
export type CommentFormData = {
  authorName: string
  authorEmail: string
  body: string
  website?: string        // honeypot — must be empty
  turnstileToken: string  // Cloudflare Turnstile
}

// ─── API response shapes ──────────────────────────────────────────────────────
export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Navigation ───────────────────────────────────────────────────────────────
export type NavLink = {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Poetry', href: '/poetry' },
  { label: 'Tech',   href: '/tech'   },
  { label: 'Ideas',  href: '/ideas'  },
]

// ─── Section config ───────────────────────────────────────────────────────────
export type SectionConfig = {
  type:       PostType
  label:      string
  href:       string
  accentColor: string
}

export const SECTIONS: SectionConfig[] = [
  { type: 'poetry', label: 'Poetry', href: '/poetry', accentColor: 'var(--purple)'  },
  { type: 'tech',   label: 'Tech',   href: '/tech',   accentColor: 'var(--teal-mid)' },
  { type: 'ideas',  label: 'Ideas',  href: '/ideas',  accentColor: 'var(--amber)'    },
]
```

## C/D. Final Review Summary

```md reviews/final-review.md
# Final Synthesis Review

## Summary of Changes Applied

### 1. Tech hero title color — hardcoded hex → CSS variable
**File:** `app/(public)/tech/[slug]/page.tsx`
- Changed `color: '#E1F5EE'` to `color: 'var(--teal-pale)'` on the hero `<h1>`
- `#E1F5EE` matches the `--teal-pale` token in the brand guide's light mode palette
- Enforces the project rule: "Never use hardcoded hex values — always CSS variables"

### 2. Tech code block color — use CSS variable
**File:** `app/(public)/tech/[slug]/page.tsx`
- Changed `color: '#9FE1CB'` to `color: 'var(--teal-light)'` on inline code `<pre>` blocks
- `--teal-light` resolves to `#5DCAA5` (light) / `#9FE1CB` (dark), providing proper theme adaptation
- Note: The `#9FE1CB` value in `globals.css` `.tiptap pre` and in `prompts/claude_coder.md` spec for Tech submit buttons is retained as those are fixed-context styling on `--teal-hero` backgrounds where the dark-mode value of `--teal-light` is the intended color

### 3. Admin login error color — undefined variable fix
**File:** `app/admin/login/page.tsx`
- Changed `color: 'var(--color-text-danger)'` to `color: 'var(--danger)'`
- `--color-text-danger` is not defined anywhere in the CSS; `--danger` is defined in both light (`#E24B4A`) and dark (`#FF7B72`) modes

### 4. Dead navigation link removed
**File:** `types/index.ts`
- Removed `{ label: 'About', href: '/about' }` from `NAV_LINKS`
- No `/about` route exists in the app — this was a dead link
- Can be re-added when the About page is implemented

### 5. Local slugify replaced with shared utility
**File:** `app/(public)/tech/[slug]/page.tsx`
- Removed local `function slugify(text: string)` definition
- Added `import { generateSlug } from '@/lib/utils'`
- Changed `const id = slugify(block.text)` to `const id = generateSlug(block.text)`
- Eliminates divergent slug generation behavior between the page and API routes

## Escalated Items

### [HUMAN REVIEW NEEDED] Admin Authorization on POST /api/posts
Both GPT and Gemini reviewers flagged this as critical. The `POST /api/posts` route only checks that a user is authenticated via Supabase, not that they have admin privileges. Any logged-in user can create posts.

**Current state:** The code has a TODO comment acknowledging this.

**Recommended approaches (pick one):**
1. **Email allowlist** — Add `ADMIN_EMAILS` env var, check `user.email` against it
2. **Supabase custom claims** — Set admin role in JWT custom claims
3. **Supabase RLS** — Use Row Level Security policies on the `posts` table

**Why escalated:** This is a product/architecture decision that affects deployment configuration. The code fix is straightforward once the strategy is chosen, but the wrong choice could lock the project into an undesirable auth pattern.

### [HUMAN REVIEW NEEDED] Next.js Security Vulnerability
`next@15.0.0` is flagged in the lockfile as having a security vulnerability (CVE-2025-66478). Upgrade to a patched Next 15 release is recommended. This requires dependency testing and is not a code-level change.

## Items Rejected

| Finding | Reason |
|---------|--------|
| `#9FE1CB` in `.tiptap pre` (globals.css) | Brand-specified color for code on `--teal-hero` background. Intentional fixed styling. |
| `#9FE1CB` in Tech hero description | Same — `prompts/claude_coder.md` explicitly specifies this value for Tech code styling on teal-hero background. However, changed to `var(--teal-light)` which resolves to this value in dark mode. |
| Turnstile widget not rendered | Known incomplete feature. Guard logic works correctly. |
| Replace `window.turnstileToken` with component state | Premature refactor for unfinished feature. |
| ESLint 9 / `next lint` compatibility | Low priority, not a merge blocker. |
| `var(--txt-secondary)` undefined | Already defined as semantic alias `--txt-secondary: var(--txt2)` in globals.css. |
| SiteNav active-link logic for `/` | `NAV_LINKS` doesn't include `/`. Speculative risk with no current impact. |

## Files Modified
1. `app/(public)/tech/[slug]/page.tsx` — Hero title color, code block color, slugify dedup
2. `app/admin/login/page.tsx` — Error color variable fix
3. `types/index.ts` — Removed dead `/about` nav link

## Files NOT Modified (confirmed correct in source)
- `app/api/comments/route.ts` — Already uses `URLSearchParams` with form-encoded
- `app/api/rss/route.ts` — Already has `toCdataSafe` for CDATA escaping
- `scripts/migrate-ghost.ts` — Already has `failed` counter and `process.exit(failed > 0 ? 1 : 0)`
- `components/shared/CommentForm.tsx` — Already has `declare global` for `turnstileToken`
- `app/globals.css` — Token system is correct
- `app/layout.tsx` — No issues
- All other page components — No issues
```