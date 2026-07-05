// app/api/about/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db }             from '@/lib/db'
import { aboutContent }   from '@/lib/db/schema'
import { auth }           from '@/lib/auth'
import { eq }             from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(aboutContent).where(eq(aboutContent.id, 1)).limit(1)
    if (!rows[0]) return NextResponse.json({ nowItems: [], bookList: {} })
    return NextResponse.json({ nowItems: rows[0].nowItems, bookList: rows[0].bookList })
  } catch {
    return NextResponse.json({ nowItems: [], bookList: {} })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
