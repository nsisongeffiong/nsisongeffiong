import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { topicTags } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { and, eq } from 'drizzle-orm'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(v => v.trim().toLowerCase()).filter(Boolean)
  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) return null
  return user
}

// ─── DELETE /api/admin/topics/[id]/tags/[tag] ─────────────────────────────────
// Removes a tag from a topic. [tag] is URL-encoded e.g. "ai%20%26%20society"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; tag: string }> }
) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { id, tag } = await params
    const decodedTag = decodeURIComponent(tag).toLowerCase()

    await db
      .delete(topicTags)
      .where(and(eq(topicTags.topicId, id), eq(topicTags.tag, decodedTag)))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/topics/[id]/tags/[tag]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
