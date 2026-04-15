import { SiteNav } from '@/components/shared/SiteNav';
import { DisqusComments } from '@/components/shared/DisqusComments';
import { CommentForm } from '@/components/shared/CommentForm';
import Link from 'next/link';

/* ── static placeholder data ── */
const post = {
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
  commentCount: 3,
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
              {post.commentCount} responses
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
            <CommentForm section="poetry" />
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
