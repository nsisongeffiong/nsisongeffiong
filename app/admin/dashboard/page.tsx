import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import { db } from '@/lib/db';
import { posts, comments } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts);

  const [draftRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(eq(posts.published, false));

  const [pendingRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comments)
    .where(eq(comments.status, 'pending'));

  const byTypeRows = await db
    .select({ type: posts.type, count: sql<number>`count(*)::int` })
    .from(posts)
    .groupBy(posts.type);

  const totalPosts = totalRow?.count ?? 0;
  const drafts = draftRow?.count ?? 0;
  const published = totalPosts - drafts;
  const pendingComments = pendingRow?.count ?? 0;

  const countByType = Object.fromEntries(byTypeRows.map((r) => [r.type, r.count]));

  const postsByTypeRows: Array<{ label: string; count: number; color: string }> = [
    { label: 'Poetry', count: countByType['poetry'] ?? 0, color: 'var(--purple)' },
    { label: 'Tech',   count: countByType['tech']   ?? 0, color: 'var(--teal-mid)' },
    { label: 'Ideas',  count: countByType['ideas']  ?? 0, color: 'var(--amber)' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />

      <main style={{ marginLeft: 220, flex: 1, padding: '2.5rem' }}>
        {/* Page header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--txt)',
              marginBottom: '0.25rem',
            }}
          >
            Dashboard
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 11,
              color: 'var(--txt3)',
            }}
          >
            Site overview
          </span>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <StatCard label="Total Posts" value={totalPosts} />
          <StatCard label="Published" value={published} />
          <StatCard label="Drafts" value={drafts} />
          <StatCard
            label="Pending Comments"
            value={pendingComments}
            valueColor="var(--amber)"
          />
        </div>

        {/* Posts by section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              marginBottom: '1rem',
              display: 'block',
            }}
          >
            Posts by section
          </span>

          {postsByTypeRows.map((row) => {
            const pct = totalPosts > 0 ? (row.count / totalPosts) * 100 : 0;
            return (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: 11,
                    color: 'var(--txt2)',
                    width: 80,
                  }}
                >
                  {row.label}
                </span>

                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: 'var(--bg3)',
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 2,
                      background: row.color,
                      width: `${pct}%`,
                    }}
                  />
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: 11,
                    color: 'var(--txt3)',
                    width: 24,
                    textAlign: 'right',
                  }}
                >
                  {row.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              marginBottom: '1rem',
              display: 'block',
            }}
          >
            Quick actions
          </span>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              href="/admin/posts/new"
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'var(--teal-hero)',
                color: 'var(--teal-light)',
                padding: '0.65rem 1.25rem',
                borderRadius: 3,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              New post
            </Link>

            <Link
              href="/admin/comments"
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'none',
                border: '0.5px solid var(--bdr2)',
                color: 'var(--txt2)',
                padding: '0.65rem 1.25rem',
                borderRadius: 3,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Review comments
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor = 'var(--teal-mid)',
}: {
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '0.5px solid var(--bdr)',
        borderRadius: 4,
        padding: '1.25rem',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--txt3)',
          marginBottom: '0.5rem',
          display: 'block',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 28,
          fontWeight: 500,
          color: valueColor,
        }}
      >
        {value}
      </span>
    </div>
  );
}
