import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { topics, topicTags } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

// GET /api/topics?section=tech
// Public — used by section pages to populate filter chips.
export async function GET(request: NextRequest) {
  try {
    const section = request.nextUrl.searchParams.get('section') as 'poetry' | 'tech' | 'ideas' | null

    if (!section || !['poetry', 'tech', 'ideas'].includes(section)) {
      return NextResponse.json({ error: 'Invalid or missing section' }, { status: 400 })
    }

    const rows = await db
      .select({
        id:          topics.id,
        label:       topics.label,
        slug:        topics.slug,
        description: topics.description,
        position:    topics.position,
        tag:         topicTags.tag,
      })
      .from(topics)
      .leftJoin(topicTags, eq(topicTags.topicId, topics.id))
      .where(eq(topics.section, section))
      .orderBy(asc(topics.position))

    // Group tags back onto each topic
    const topicMap = new Map<string, {
      id: string; label: string; slug: string
      description: string | null; position: string; tags: string[]
    }>()

    for (const row of rows) {
      if (!topicMap.has(row.id)) {
        topicMap.set(row.id, {
          id: row.id, label: row.label, slug: row.slug,
          description: row.description, position: row.position, tags: [],
        })
      }
      if (row.tag) topicMap.get(row.id)!.tags.push(row.tag)
    }

    const result = Array.from(topicMap.values())
      .sort((a, b) => Number(a.position) - Number(b.position))

    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/topics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
