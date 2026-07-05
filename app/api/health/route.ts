import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[GET /api/health]', error)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
