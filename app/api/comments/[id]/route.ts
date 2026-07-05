import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()

  if (!session?.user) return { user: null, error: NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 }) }

  return { user: session.user, error: null }
}

// PATCH /api/comments/[id] — update comment status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
      return NextResponse.json({ success: false, error: 'status must be "approved", "rejected", or "pending"' }, { status: 400 })
    }

    const [existing] = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, id)).limit(1)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    }

    const [comment] = await db
      .update(comments)
      .set({ status, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning()

    return NextResponse.json({ success: true, data: comment })
  } catch (error) {
    console.error('[PATCH /api/comments/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to update comment' }, { status: 500 })
  }
}

// DELETE /api/comments/[id] — delete a comment (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params

    const [existing] = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, id)).limit(1)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    }

    await db.delete(comments).where(eq(comments.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/comments/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to delete comment' }, { status: 500 })
  }
}
