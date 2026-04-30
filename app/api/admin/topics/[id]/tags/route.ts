import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { topicTags } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(v => v.trim().toLowerCase()).filter(Boolean)
  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) return null
  return user
}

// ─── POST /api/admin/topics/[id]/tags ────────────────────────────────────────
// Body: { tag: string }
// Adds a tag string to a topic. Tag is lowercased before storing.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const tag = body.tag?.trim().toLowerCase()

    if (!tag) return NextResponse.json({ error: 'tag is required' }, { status: 400 })

    const [row] = await db
      .insert(topicTags)
      .values({ topicId: id, tag })
      .onConflictDoNothing()
      .returning()

    return NextResponse.json(row ?? { topicId: id, tag }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/topics/[id]/tags]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
