import { SiteNav } from '@/components/shared/SiteNav';
import { CommentForm } from '@/components/shared/CommentForm';

/* ── static placeholder data ── */
const post = {
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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
                color: '#E1F5EE',
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
                const id = slugify(block.text);
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
                      color: '#9FE1CB',
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
          <CommentForm section="tech" />
        </section>
      </main>
    </>
  );
}
