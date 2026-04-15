import { SiteNav } from '@/components/shared/SiteNav';
import { CommentForm } from '@/components/shared/CommentForm';

/* ── static placeholder data ─────────────────────────────────── */

const post = {
  slug: 'the-case-for-radical-incrementalism',
  kicker: 'Policy Framework',
  title: 'The Case for Radical Incrementalism',
  deck: 'Why the most effective reforms rarely announce themselves — and what that means for how we build institutions in an age of spectacle.',
  volume: 'Vol. I',
  author: 'Nsisong Effiong',
  date: 'March 14, 2024',
  readTime: '11 min read',
  body: `
    <p class="ideas-lede">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras vehicula, mi eget laoreet venenatis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla facilisi. Etiam non diam ante. Duis mattis elit nec risus sagittis, at tempus odio pretium. Suspendisse blandit ligula pellentesque mauris semper, vel pulvinar lacus facilisis. Praesent at nulla eu arcu cursus venenatis sit amet non purus.</p>

    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>

    <aside class="ideas-pq ideas-pq--right">
      <p>&ldquo;Incrementalism is not timidity&thinsp;&mdash;&thinsp;it is the discipline of compounding small truths into irreversible change.&rdquo;</p>
    </aside>

    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>

    <h2>The Institutional Paradox</h2>

    <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>

    <aside class="ideas-pq ideas-pq--left">
      <p>&ldquo;The institutions that endure are those that evolve without anyone noticing they have changed at all.&rdquo;</p>
    </aside>

    <p>Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.</p>

    <div class="ideas-section-break">I.</div>

    <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>

    <h2>Compounding at the Margins</h2>

    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem.</p>

    <aside class="ideas-pq ideas-pq--centre">
      <p>&ldquo;Reform is architecture, not demolition.&rdquo;</p>
      <span class="ideas-pq__attr">&mdash; Nsisong Effiong</span>
    </aside>

    <p>Accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>

    <div class="ideas-section-break">II.</div>

    <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.</p>

    <p>Nisi ut aliquid ex ea commodi consequatur quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur excepteur sint occaecat cupidatat non proident.</p>
  `,
};

const prevPost = {
  slug: 'digital-sovereignty-and-the-commons',
  title: 'Digital Sovereignty and the Commons',
};

const nextPost = {
  slug: 'after-extraction-what-remains',
  title: 'After Extraction, What Remains',
};

interface Reply {
  id: string;
  name: string;
  date: string;
  body: string;
}

interface Comment {
  id: string;
  name: string;
  date: string;
  body: string;
  replies: Reply[];
}

const comments: Comment[] = [
  {
    id: 'c1',
    name: 'Amara Obi',
    date: 'March 16, 2024',
    body: 'This reframing of incrementalism as discipline rather than timidity is exactly the lens missing from most policy debates. The compounding metaphor is particularly apt — it maps perfectly onto how successful institutional reforms actually propagate.',
    replies: [
      {
        id: 'r1',
        name: 'Nsisong Effiong',
        date: 'March 17, 2024',
        body: 'Thank you, Amara. The compounding frame came from watching how pension reform in Chile unfolded over three decades — each adjustment invisible at the time, transformative in aggregate.',
      },
    ],
  },
  {
    id: 'c2',
    name: 'David Mensah',
    date: 'March 18, 2024',
    body: 'I wonder if the argument holds in contexts where institutions are fundamentally extractive. Can you increment your way out of a structure designed to resist change from within?',
    replies: [],
  },
];

/* ── page component ──────────────────────────────────────────── */

export default function IdeasSinglePost() {
  const commentCount = comments.reduce(
    (acc, c) => acc + 1 + c.replies.length,
    0,
  );

  return (
    <>
      <SiteNav />

      <main style={{ minHeight: '100vh' }}>
        {/* ── Back bar ── */}
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '1.5rem 2rem 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <a
            href="/ideas"
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--txt2)',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            ← Ideas &amp; Policy
          </a>
          <span
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--amber)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {post.volume}
          </span>
        </div>

        {/* ── Header ── */}
        <header
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '1.75rem 2rem 2rem',
            borderBottom: '2.5px solid var(--txt)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--amber)',
              display: 'block',
              marginBottom: '0.6rem',
            }}
          >
            {post.kicker}
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 800,
              fontSize: 46,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              color: 'var(--txt)',
              margin: '0 0 0.85rem',
            }}
          >
            {post.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-source-serif), serif',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--txt2)',
              margin: '0 0 1.2rem',
              maxWidth: 640,
            }}
          >
            {post.deck}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              fontFamily: 'var(--font-source-serif), serif',
              fontSize: 13,
              color: 'var(--txt3)',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--txt)' }}>
              {post.author}
            </span>
            <span
              aria-hidden="true"
              style={{
                width: 1,
                height: 13,
                background: 'var(--bdr)',
                display: 'inline-block',
              }}
            />
            <span>{post.date}</span>
            <span
              aria-hidden="true"
              style={{
                width: 1,
                height: 13,
                background: 'var(--bdr)',
                display: 'inline-block',
              }}
            />
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* ── Body ── */}
        <article
          className="ideas-body"
          style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '2.25rem 2rem',
          }}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* ── Prev / Next ── */}
        <nav
          style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '0 2rem',
          }}
        >
          <div
            style={{
              borderTop: '2px solid var(--txt)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <a
              href={`/ideas/${prevPost.slug}`}
              style={{
                display: 'block',
                padding: '1.5rem 1rem 1.5rem 0',
                textDecoration: 'none',
                borderRight: '1px solid var(--bdr)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--txt3)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                Previous
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 15,
                  lineHeight: 1.4,
                  color: 'var(--txt)',
                }}
              >
                {prevPost.title}
              </span>
            </a>

            <a
              href={`/ideas/${nextPost.slug}`}
              style={{
                display: 'block',
                padding: '1.5rem 0 1.5rem 1rem',
                textDecoration: 'none',
                textAlign: 'right',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--txt3)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                Next
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-source-serif), serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 15,
                  lineHeight: 1.4,
                  color: 'var(--txt)',
                }}
              >
                {nextPost.title}
              </span>
            </a>
          </div>
        </nav>

        {/* ── Comments ── */}
        <section
          style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '0 2rem 4rem',
          }}
        >
          <div
            style={{
              borderTop: '3px solid var(--txt)',
              paddingTop: '1.5rem',
              marginTop: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '2rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--txt)',
                margin: 0,
              }}
            >
              Responses
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--amber)',
                letterSpacing: '0.02em',
              }}
            >
              {commentCount} responses · {post.volume}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}
          >
            {comments.map((comment) => (
              <div key={comment.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 700,
                      fontSize: 14,
                      color: 'var(--txt)',
                    }}
                  >
                    {comment.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--txt3)',
                    }}
                  >
                    {comment.date}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-source-serif), serif',
                    fontWeight: 300,
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: 'var(--txt2)',
                    margin: '0 0 0.6rem',
                  }}
                >
                  {comment.body}
                </p>

                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--amber)',
                    cursor: 'pointer',
                  }}
                >
                  Reply →
                </button>

                {comment.replies.length > 0 && (
                  <div
                    style={{
                      marginLeft: '2rem',
                      paddingLeft: '1.25rem',
                      borderLeft: '2px solid var(--amber-pq)',
                      marginTop: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                    }}
                  >
                    {comment.replies.map((reply) => (
                      <div key={reply.id}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: '0.35rem',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-syne), sans-serif',
                              fontWeight: 700,
                              fontSize: 13,
                              color: 'var(--txt)',
                            }}
                          >
                            {reply.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-syne), sans-serif',
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: 'var(--txt3)',
                            }}
                          >
                            {reply.date}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: 'var(--font-source-serif), serif',
                            fontWeight: 300,
                            fontSize: 14,
                            lineHeight: 1.75,
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

          {/* Form separator */}
          <div
            style={{
              width: 40,
              height: 2,
              background: 'var(--amber)',
              margin: '2.5rem 0 2rem',
            }}
          />

          <CommentForm section="ideas" />
        </section>
      </main>

      {/* ── Scoped styles for body HTML content ── */}
      <style>{`
        .ideas-body .ideas-lede::first-letter {
          font-family: var(--font-syne), sans-serif;
          font-size: 5em;
          font-weight: 800;
          float: left;
          line-height: 0.82;
          margin: 0.06em 0.1em 0 0;
          color: var(--txt);
        }

        .ideas-body .ideas-lede {
          font-family: var(--font-source-serif), serif;
          font-weight: 300;
          font-size: 15px;
          line-height: 1.9;
          color: var(--txt2);
          margin: 0 0 1.4rem;
        }

        .ideas-body p {
          font-family: var(--font-source-serif), serif;
          font-weight: 300;
          font-size: 15px;
          line-height: 1.9;
          color: var(--txt2);
          margin: 0 0 1.4rem;
        }

        .ideas-body h2 {
          font-family: var(--font-syne), sans-serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.02em;
          color: var(--txt);
          clear: both;
          margin: 2.2rem 0 1rem;
        }

        /* ── Pull quotes shared ── */
        .ideas-body .ideas-pq {
          padding: 0.9rem 0 0.7rem;
        }

        .ideas-body .ideas-pq p {
          font-family: var(--font-syne), sans-serif;
          font-weight: 600;
          font-size: 15px;
          line-height: 1.5;
          color: var(--txt);
          margin: 0;
        }

        .ideas-body .ideas-pq--right {
          float: right;
          width: 41%;
          margin: 0.4rem -0.5rem 1rem 1.6rem;
          border-top: 2.5px solid var(--txt);
          border-bottom: 0.5px solid var(--bdr);
          text-align: right;
        }

        .ideas-body .ideas-pq--left {
          float: left;
          width: 41%;
          margin: 0.4rem 1.6rem 1rem -0.5rem;
          border-top: 2.5px solid var(--amber);
          border-bottom: 0.5px solid var(--bdr);
        }

        .ideas-body .ideas-pq--centre {
          float: none;
          clear: both;
          width: auto;
          max-width: 520px;
          margin: 2rem auto;
          border-top: 2.5px solid var(--amber);
          border-bottom: 0.5px solid var(--bdr);
          text-align: center;
          padding: 1.1rem 0 0.9rem;
        }

        .ideas-body .ideas-pq--centre p {
          font-family: var(--font-syne), sans-serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 1.45;
          color: var(--txt);
          margin: 0 0 0.5rem;
        }

        .ideas-body .ideas-pq__attr {
          font-family: var(--font-syne), sans-serif;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--txt3);
        }

        /* ── Section break: line — numeral — line ── */
        .ideas-body .ideas-section-break {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2.5rem 0;
          clear: both;
          font-family: var(--font-syne), sans-serif;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--txt3);
          white-space: nowrap;
        }

        .ideas-body .ideas-section-break::before,
        .ideas-body .ideas-section-break::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: var(--bdr);
        }
      `}</style>
    </>
  );
}
