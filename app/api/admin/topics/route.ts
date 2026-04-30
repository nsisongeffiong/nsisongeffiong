import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { topics, topicTags } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { asc, eq } from 'drizzle-orm'

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(v => v.trim().toLowerCase()).filter(Boolean)

  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) return null
  return user
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── GET /api/admin/topics ────────────────────────────────────────────────────
// Returns all topics grouped by section, each with their tag list.

export async function GET() {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const rows = await db
      .select({
        id:          topics.id,
        label:       topics.label,
        slug:        topics.slug,
        section:     topics.section,
        description: topics.description,
        position:    topics.position,
        createdAt:   topics.createdAt,
        tag:         topicTags.tag,
      })
      .from(topics)
      .leftJoin(topicTags, eq(topicTags.topicId, topics.id))
      .orderBy(asc(topics.section), asc(topics.position))

    // Group tags onto each topic
    const topicMap = new Map<string, {
      id: string; label: string; slug: string; section: string
      description: string | null; position: string
      createdAt: Date; tags: string[]
    }>()

    for (const row of rows) {
      if (!topicMap.has(row.id)) {
        topicMap.set(row.id, {
          id: row.id, label: row.label, slug: row.slug,
          section: row.section, description: row.description,
          position: row.position, createdAt: row.createdAt, tags: [],
        })
      }
      if (row.tag) topicMap.get(row.id)!.tags.push(row.tag)
    }

    return NextResponse.json(Array.from(topicMap.values()))
  } catch (err) {
    console.error('[GET /api/admin/topics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST /api/admin/topics ───────────────────────────────────────────────────
// Body: { label, section, description? }

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { label, section, description } = body

    if (!label || !section) {
      return NextResponse.json({ error: 'label and section are required' }, { status: 400 })
    }

    if (!['poetry', 'tech', 'ideas'].includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    // Position = last in section + 1
    const existing = await db
      .select({ position: topics.position })
      .from(topics)
      .where(eq(topics.section, section))

    const maxPosition = existing.reduce((max, t) => Math.max(max, Number(t.position)), 0)

    const slug = `${section}-${slugify(label)}`

    const [topic] = await db
      .insert(topics)
      .values({
        label,
        slug,
        section,
        description: description ?? null,
        position:    String(maxPosition + 1),
      })
      .returning()

    return NextResponse.json(topic, { status: 201 })
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'A topic with that name already exists in this section' }, { status: 409 })
    }
    console.error('[POST /api/admin/topics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
