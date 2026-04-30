import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { topics } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq } from 'drizzle-orm'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(v => v.trim().toLowerCase()).filter(Boolean)
  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) return null
  return user
}

// ─── PATCH /api/admin/topics/[id] ────────────────────────────────────────────
// Body: { label?, description?, position? }

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { label, description, position } = body

    const updates: Record<string, unknown> = {}
    if (label       !== undefined) updates.label       = label
    if (description !== undefined) updates.description = description
    if (position    !== undefined) updates.position    = String(position)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const [updated] = await db
      .update(topics)
      .set(updates)
      .where(eq(topics.id, id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/admin/topics/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── DELETE /api/admin/topics/[id] ───────────────────────────────────────────
// Cascades to topic_tags and post_topics via FK.

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { id } = await params

    const [deleted] = await db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning()

    if (!deleted) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/topics/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
