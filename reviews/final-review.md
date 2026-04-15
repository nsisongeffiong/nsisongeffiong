Looking at the source code alongside both reviews and the previous final review, I need to carefully verify what's already been fixed and what still needs attention.

## A. Triage of All Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| G1 | Admin-only post creation not enforced (`POST /api/posts`) | **ESCALATE** | Critical security gap. Both reviewers flagged. Requires product decision on admin identity strategy. Code has TODO comment acknowledging it. |
| G2 | `window.turnstileToken` — no Turnstile widget rendered | **REJECT** | Known incomplete feature. The guard logic is correct. Widget integration is a separate task. |
| G3 | Hardcoded `#E1F5EE` in tech/[slug] hero title | **ACCEPT** | Violates brand rule. `#E1F5EE` matches `--teal-pale` in light mode. Replace with `var(--teal-pale)`. |
| G4 | Hardcoded `#9FE1CB` in tech/[slug] code blocks | **ACCEPT** | Violates the explicit project rule "Never use hardcoded hex values in component styles." Replace with `var(--teal-light)` which resolves to `#9FE1CB` in dark mode and `#5DCAA5` in light — both appropriate on `--teal-hero` backgrounds. |
| G5 | `app/globals.css` `.tiptap pre` uses `#9FE1CB` | **ACCEPT** | Same rule violation as G4. Replace with `var(--teal-light)`. |
| G6 | Admin login error color `var(--danger)` | **REJECT** | Checking source: the current code already uses `color: 'var(--danger)'` which IS defined. No bug exists. Previous review already noted this was correct. |
| G7 | Dead `/about` nav link | **REJECT** | Checking source: `NAV_LINKS` in `types/index.ts` does NOT contain an `/about` entry. It only has Poetry, Tech, Ideas. No dead link exists. |
| G8 | `next lint` incompatibility | **REJECT** | Low priority, not a merge blocker. |
| G9 | `next@15.0.0` security vulnerability | **ESCALATE** | Package upgrade, not a code change. Requires testing. |
| G10 | De-duplicate local `slugify` in tech/[slug] | **ACCEPT** | Good hygiene. Local `slugify` diverges from `generateSlug`. |
| G11 | Replace `window.turnstileToken` with component state | **REJECT** | Premature for incomplete feature. |
| G12 | Improve admin login catch block error message | **REJECT** | Current behavior is acceptable for a login form. Distinguishing network vs auth errors can leak information. |
| G13 | Poetry comment count drift (`post.commentCount` hardcoded 3) | **ACCEPT** | Should derive from rendered data like ideas page does. |
| G14 | `dangerouslySetInnerHTML` in ideas/[slug] | **REJECT** | Current content is hardcoded placeholder. XSS concern is valid for future DB-backed content but not actionable now. |
| Gem1 | Broken Access Control on POST /api/posts | **ESCALATE** | Same as G1. |

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

```tsx app/(public)/poetry/[slug]/page.tsx
import { SiteNav } from '@/components/shared/SiteNav';
import { DisqusComments } from '@/components/shared/DisqusComments';
import { CommentForm } from '@/components/shared/CommentForm';
import Link from 'next/link';

/* ── static placeholder data ── */
const post = {
  id: 'placeholder-id',
  slug: 'the-weight-of-morning',
  title: 'The Weight of Morning',
  category: 'Lyric',
  author: 'Nsisong Effiong',
  date: '12 March 2024',
  metadata: {
    legacyDisqus: false,
  },
  stanzas: [
    {
      lines: [
        { text: 'I woke to the weight of morning,', indent: 0 },
        { text: 'the light a slow persuasion', indent: 0 },
        { text: 'pressing through curtains drawn', indent: 1 },
        { text: 'against forgetting.', indent: 2 },
      ],
    },
    {
      lines: [
        { text: 'There is a name for this hour—', indent: 0 },
        { text: 'the one the body remembers', indent: 0 },
        { text: 'before the mind agrees to rise,', indent: 1 },
        { text: 'before language finds its feet.', indent: 1 },
      ],
    },
    {
      lines: [
        { text: 'I held the silence like a bowl,', indent: 0 },
        { text: 'careful not to spill', indent: 1 },
        { text: 'the little water left.', indent: 2 },
      ],
    },
  ],
  poetsNote:
    'This poem began as a journal entry on a morning in Lagos when the power had been out for two days. I was thinking about how the body carries its own clock, separate from alarms and obligations—how waking is itself an act of faith.',
};

const prevPost = {
  slug: 'estuary',
  title: 'Estuary',
};

const nextPost = {
  slug: 'letter-to-a-stranger',
  title: 'Letter to a Stranger',
};

const comments: Array<{
  id: string;
  name: string;
  date: string;
  body: string;
  replies: Array<{ id: string; name: string; date: string; body: string }>;
}> = [
  {
    id: '1',
    name: 'Adaeze',
    date: '13 Mar 2024',
    body: 'The image of holding silence like a bowl—careful not to spill—stayed with me all afternoon.',
    replies: [
      {
        id: '1a',
        name: 'Nsisong',
        date: '14 Mar 2024',
        body: 'Thank you, Adaeze. That image surprised me too when it arrived.',
      },
    ],
  },
  {
    id: '2',
    name: 'Tunde',
    date: '15 Mar 2024',
    body: 'I keep returning to the second stanza. "Before language finds its feet" is a line I wish I had written.',
    replies: [],
  },
];

export default function PoetrySinglePage() {
  const commentCount = comments.reduce(
    (acc, c) => acc + 1 + c.replies.length,
    0,
  );

  return (
    <>
      <SiteNav />

      <main
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          color: 'var(--txt)',
          background: 'var(--bg)',
          minHeight: '100vh',
        }}
      >
        {/* ── back link ── */}
        <div
          style={{
            maxWidth: 580,
            margin: '0 auto',
            padding: '2rem 1.5rem 0',
          }}
        >
          <Link
            href="/poetry"
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              color: 'var(--txt2)',
              textDecoration: 'none',
            }}
          >
            ← Poetry
          </Link>
        </div>

        {/* ── header ── */}
        <header
          style={{
            maxWidth: 580,
            margin: '0 auto',
            padding: '2.5rem 1.5rem 0',
            textAlign: 'center',
          }}
        >
          {/* category tag */}
          <span
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '0.7rem',
              fontVariant: 'all-small-caps',
              letterSpacing: '0.14em',
              color: 'var(--purple-acc)',
              textTransform: 'uppercase',
            }}
          >
            {post.category}
          </span>

          {/* title */}
          <h1
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '3.375rem',
              lineHeight: 1.1,
              margin: '0.75rem 0 1rem',
              color: 'var(--txt)',
            }}
          >
            {post.title}
          </h1>

          {/* meta */}
          <div
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: 'var(--txt2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{post.author}</span>
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--purple-acc)',
              }}
            />
            <span>{post.date}</span>
          </div>
        </header>

        {/* ── ornamental rule ── */}
        <OrnamentalRule />

        {/* ── poem body ── */}
        <article
          style={{
            maxWidth: 440,
            margin: '0 auto',
            padding: '0 1.5rem',
          }}
        >
          {post.stanzas.map((stanza, si) => (
            <div
              key={si}
              style={{
                marginBottom: '2rem',
                textAlign: 'center',
              }}
            >
              {stanza.lines.map((line, li) => (
                <span
                  key={li}
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: '1.15rem',
                    lineHeight: 2,
                    paddingLeft: line.indent > 0 ? `${line.indent * 2}em` : undefined,
                  }}
                >
                  {line.text}
                </span>
              ))}
            </div>
          ))}
        </article>

        {/* ── end mark ── */}
        <div
          style={{
            textAlign: 'center',
            padding: '1rem 0 2.5rem',
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '1.25rem',
            color: 'var(--purple-acc)',
            letterSpacing: '0.3em',
          }}
        >
          · · ·
        </div>

        {/* ── poet's note ── */}
        {post.poetsNote && (
          <section
            style={{
              maxWidth: 440,
              margin: '0 auto',
              padding: '0 1.5rem 2.5rem',
            }}
          >
            <hr
              style={{
                border: 'none',
                borderTop: '0.5px solid var(--bdr2)',
                margin: '0 0 1.25rem',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '0.65rem',
                fontVariant: 'all-small-caps',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--txt3)',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Poet&rsquo;s note
            </span>
            <p
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '0.95rem',
                lineHeight: 1.75,
                color: 'var(--txt2)',
                margin: 0,
              }}
            >
              {post.poetsNote}
            </p>
          </section>
        )}

        {/* ── prev / next navigation ── */}
        <nav
          style={{
            maxWidth: 580,
            margin: '0 auto',
            padding: '0 1.5rem 2.5rem',
          }}
        >
          <hr
            style={{
              border: 'none',
              borderTop: '0.5px solid var(--bdr2)',
              margin: '0 0 1.5rem',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            {prevPost ? (
              <Link
                href={`/poetry/${prevPost.slug}`}
                style={{
                  textDecoration: 'none',
                  textAlign: 'left',
                  maxWidth: '45%',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '0.65rem',
                    fontVariant: 'all-small-caps',
                    letterSpacing: '0.12em',
                    color: 'var(--txt3)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Previous
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: '1.1rem',
                    color: 'var(--txt)',
                  }}
                >
                  {prevPost.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link
                href={`/poetry/${nextPost.slug}`}
                style={{
                  textDecoration: 'none',
                  textAlign: 'right',
                  maxWidth: '45%',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '0.65rem',
                    fontVariant: 'all-small-caps',
                    letterSpacing: '0.12em',
                    color: 'var(--txt3)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Next
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: '1.1rem',
                    color: 'var(--txt)',
                  }}
                >
                  {nextPost.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>

        {/* ── comments section ── */}
        <section
          style={{
            maxWidth: 580,
            margin: '0 auto',
            padding: '0 1.5rem 4rem',
          }}
        >
          {/* ornamental rule above comments */}
          <OrnamentalRule />

          {/* count label */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '0.65rem',
                fontVariant: 'all-small-caps',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--txt3)',
              }}
            >
              {commentCount} responses
            </span>
          </div>

          {/* comments list */}
          <div style={{ marginBottom: '2.5rem' }}>
            {comments.map((comment) => (
              <div key={comment.id} style={{ marginBottom: '1.75rem' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant), serif',
                      fontStyle: 'italic',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--txt)',
                    }}
                  >
                    {comment.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant), serif',
                      fontStyle: 'italic',
                      fontSize: '0.8rem',
                      color: 'var(--txt3)',
                      marginLeft: '0.75rem',
                    }}
                  >
                    {comment.date}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    color: 'var(--txt2)',
                    margin: '0.25rem 0 0',
                  }}
                >
                  {comment.body}
                </p>

                {/* replies */}
                {comment.replies.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        style={{
                          borderLeft: '1px solid var(--purple-acc)',
                          paddingLeft: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ marginBottom: '0.25rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-cormorant), serif',
                              fontStyle: 'italic',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: 'var(--txt)',
                            }}
                          >
                            {reply.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-cormorant), serif',
                              fontStyle: 'italic',
                              fontSize: '0.75rem',
                              color: 'var(--txt3)',
                              marginLeft: '0.75rem',
                            }}
                          >
                            {reply.date}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: 'var(--font-cormorant), serif',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            fontSize: '0.9rem',
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

          {/* comment form or disqus */}
          {post.metadata.legacyDisqus ? (
            <DisqusComments slug={post.slug} title={post.title} path={`/poetry/${post.slug}`} />
          ) : (
            <CommentForm postId={post.id} section="poetry" />
          )}
        </section>
      </main>
    </>
  );
}

/* ── ornamental rule component ── */
function OrnamentalRule() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        maxWidth: 580,
        margin: '2rem auto',
        padding: '0 1.5rem',
      }}
    >
      <span
        style={{
          flex: 1,
          height: '0.5px',
          background: 'var(--bdr2)',
        }}
      />
      <span
        style={{
          display: 'inline-block',
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--purple-acc)',
        }}
      />
      <span
        style={{
          flex: 1,
          height: '0.5px',
          background: 'var(--bdr2)',
        }}
      />
    </div>
  );
}
```

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
  color: var(--teal-light);
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

## C. Final Review Summary

```md reviews/final-review.md
# Final Synthesis Review

## Summary of Changes Applied

### 1. Tech hero title — hardcoded `#E1F5EE` → `var(--teal-pale)`
**File:** `app/(public)/tech/[slug]/page.tsx`
- `#E1F5EE` matches `--teal-pale` in light mode. Using the CSS variable ensures proper dark mode adaptation.

### 2. Tech code blocks — hardcoded `#9FE1CB` → `var(--teal-light)`
**File:** `app/(public)/tech/[slug]/page.tsx`
- Inline code `<pre>` blocks now use `var(--teal-light)` instead of hardcoded hex.
- `--teal-light` resolves to `#5DCAA5` (light) / `#9FE1CB` (dark), both appropriate on `--teal-hero` backgrounds.

### 3. Tiptap pre color — hardcoded `#9FE1CB` → `var(--teal-light)`
**File:** `app/globals.css`
- `.tiptap pre` color changed from `#9FE1CB` to `var(--teal-light)` for consistency with the token system.

### 4. Local slugify replaced with shared utility
**File:** `app/(public)/tech/[slug]/page.tsx`
- Removed local `function slugify()` definition.
- Added `import { generateSlug } from '@/lib/utils'`.
- Prevents divergent slug generation between UI and API.

### 5. Poetry comment count derived from rendered data
**File:** `app/(public)/poetry/[slug]/page.tsx`
- Removed hardcoded `post.commentCount` (was `3`, actual data has `3` but could drift).
- Added `commentCount` computed from `comments.reduce()`, matching the pattern used in the ideas page.
- Removed `commentCount` from the `post` object.

## Escalated Items

### [HUMAN REVIEW NEEDED] Admin Authorization on POST /api/posts
Both GPT and Gemini flagged this. Any authenticated Supabase user can create posts — no admin role check exists.

**Current state:** Code has a TODO comment acknowledging this.

**Recommended approaches:**
1. **Email allowlist** — `ADMIN_EMAILS` env var
2. **Supabase custom claims** — admin role in JWT
3. **Supabase RLS** — Row Level Security on `posts` table

**Why escalated:** Architecture decision needed before implementation.

### [HUMAN REVIEW NEEDED] Next.js Security Vulnerability
`next@15.0.0` has CVE-2025-66478. Upgrade to patched release recommended. Requires dependency testing.

## Items Rejected

| Finding | Reason |
|---------|--------|
| Turnstile widget not rendered | Known incomplete feature. Guard logic correct. |
| Replace `window.turnstileToken` with state | Premature for unfinished feature. |
| ESLint 9 / `next lint` compatibility | Not a merge blocker. |
| Admin login catch → network error message | Acceptable UX. Distinguishing errors can leak info. |
| Dead `/about` nav link | Does not exist in current source. |
| `var(--danger)` undefined | Already defined correctly in source. |
| `dangerouslySetInnerHTML` XSS | Placeholder content only. Address when DB-backed. |

## Files Modified
1. `app/(public)/tech/[slug]/page.tsx` — hero title color, code block color, slugify dedup
2. `app/(public)/poetry/[slug]/page.tsx` — derived comment count
3. `app/globals.css` — tiptap pre color token

## Files NOT Modified (verified correct)
- `app/admin/login/page.tsx` — already uses `var(--danger)` correctly
- `types/index.ts` — no dead `/about` link exists
- `app/api/comments/route.ts` — already uses URLSearchParams
- `app/api/rss/route.ts` — already has CDATA escaping
- All other files — no actionable issues
```