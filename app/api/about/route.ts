// app/api/about/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db }             from '@/lib/db'
import { aboutContent }   from '@/lib/db/schema'
import { createServerClient } from '@/lib/supabase/server'
import { eq }             from 'drizzle-orm'

export async function GET() {
  const rows = await db.select().from(aboutContent).where(eq(aboutContent.id, 1)).limit(1)
  if (!rows[0]) return NextResponse.json({ nowItems: [], bookList: {} })
  return NextResponse.json({ nowItems: rows[0].nowItems, bookList: rows[0].bookList })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  if (!adminEmails.includes(user.email ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { nowItems, bookList } = await req.json()
  const existing = await db.select({ id: aboutContent.id })
    .from(aboutContent).where(eq(aboutContent.id, 1)).limit(1)

  if (existing[0]) {
    await db.update(aboutContent)
      .set({ nowItems, bookList, updatedAt: new Date() })
      .where(eq(aboutContent.id, 1))
  } else {
    await db.insert(aboutContent).values({ id: 1, nowItems, bookList })
  }
  return NextResponse.json({ ok: true })
}
