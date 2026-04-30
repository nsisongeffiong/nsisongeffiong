import AdminNav from '@/components/admin/AdminNav';
import PostEditor from '@/components/admin/PostEditorClient';
import { db } from '@/lib/db';
import { posts, postTopics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) notFound();

  const existingTopics = await db
    .select({ topicId: postTopics.topicId })
    .from(postTopics)
    .where(eq(postTopics.postId, id));

  const topicIds = existingTopics.map(t => t.topicId);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <main style={{ marginLeft: '220px', flex: 1, padding: '2.5rem' }}>
        <Link
          href="/admin/posts"
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            color: 'var(--txt3)',
            textDecoration: 'none',
            display: 'block',
            marginBottom: '1.5rem',
          }}
        >
          ← Back to posts
        </Link>
        <h1
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--txt)',
            marginBottom: '2rem',
          }}
        >
          Edit post
        </h1>
        <PostEditor postId={post.id} initialData={{
          id: post.id,
          title: post.title,
          type: post.type as 'tech' | 'ideas' | 'poetry',
          content: post.content ?? '',
          excerpt: post.excerpt ?? '',
          tags: post.tags ?? [],
          published: post.published ?? false,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          createdAt: post.createdAt?.toISOString() ?? null,
          metadata: (post.metadata ?? {}) as Record<string, unknown>,
          topicIds,
        }} />
      </main>
    </div>
  );
}
