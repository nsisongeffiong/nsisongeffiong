import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq, desc, and } from 'drizzle-orm'
import { generateSlug } from '@/lib/utils'
import type { PostType } from '@/types'

// GET /api/posts — fetch published posts, optionally filtered by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type  = searchParams.get('type') as PostType | null
    const rawLimit = parseInt(searchParams.get('limit') ?? '20')
    const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 100)

    const conditions = [eq(posts.published, true)]
    if (type) conditions.push(eq(posts.type, type))

    const result = await db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/posts]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts — create a new post (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorised' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, type, content, excerpt, tags, metadata, published } = body

    if (!title || !type || !content) {
      return NextResponse.json(
        { success: false, error: 'title, type, and content are required' },
        { status: 400 }
      )
    }

    const ALLOWED_TYPES: PostType[] = ['poetry', 'tech', 'ideas']
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: `type must be one of: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const slug = generateSlug(title)

    const [post] = await db
      .insert(posts)
      .values({
        title,
        type,
        slug,
        content,
        excerpt:     excerpt ?? null,
        tags:        tags ?? [],
        metadata:    metadata ?? {},
        published:   published ?? false,
        publishedAt: published ? new Date() : null,
      })
      .returning()

    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (error: any) {
    // Unique constraint on slug
    if (error?.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A post with this title already exists' },
        { status: 409 }
      )
    }
    console.error('[POST /api/posts]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
