import { db } from '@/lib/db'
import { posts, comments } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import CommentsClient from '@/components/admin/CommentsClient'

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  const allComments = await db
    .select({
      id: comments.id,
      postTitle: posts.title,
      postType: posts.type,
      authorName: comments.authorName,
      authorEmail: comments.authorEmail,
      body: comments.body,
      status: comments.status,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .orderBy(desc(comments.createdAt))

  return <CommentsClient initialComments={allComments} />
}
