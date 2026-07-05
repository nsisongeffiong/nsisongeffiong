import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { topics } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

async function requireAdmin() {
  const session = await auth()
  return session?.user ?? null
}

// ─── PATCH /api/admin/topics/reorder ─────────────────────────────────────────
// Body: { order: { id: string; position: number }[] }
// Updates positions for a list of topics in bulk.

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { order } = body as { order: { id: string; position: number }[] }

    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'order array is required' }, { status: 400 })
    }

    await Promise.all(
      order.map(({ id, position }) =>
        db.update(topics).set({ position: String(position) }).where(eq(topics.id, id))
      )
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/admin/topics/reorder]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
