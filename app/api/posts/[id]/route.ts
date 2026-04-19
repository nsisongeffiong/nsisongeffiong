import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { user: null, error: NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 }) }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)

  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, error: null }
}

// PATCH /api/posts/[id] — update an existing post (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const { title, type, content, excerpt, tags, metadata, published } = body

    const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    const setPublishedAt =
      published === true && !existing.published ? new Date() : existing.publishedAt

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (title     !== undefined) updates.title     = title
    if (type      !== undefined) updates.type      = type
    if (content   !== undefined) updates.content   = content
    if (excerpt   !== undefined) updates.excerpt   = excerpt
    if (tags      !== undefined) updates.tags      = tags
    if (metadata  !== undefined) updates.metadata  = metadata
    if (published !== undefined) {
      updates.published   = published
      updates.publishedAt = setPublishedAt
    }

    const [post] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning()

    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    console.error('[PATCH /api/posts/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/posts/[id] — delete a post (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params

    const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).limit(1)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    await db.delete(posts).where(eq(posts.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/posts/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 })
  }
}
