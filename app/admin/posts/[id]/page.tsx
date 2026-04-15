import AdminNav from '@/components/admin/AdminNav';
import PostEditor from '@/components/admin/PostEditor';
import Link from 'next/link';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = {
    id,
    title: 'Editing post ' + id,
    type: 'tech' as const,
    content: '<p>Post content here</p>',
    excerpt: '',
    tags: [] as string[],
    published: false,
  };

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
        <PostEditor initialData={post} />
      </main>
    </div>
  );
}
