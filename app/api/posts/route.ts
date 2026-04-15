import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq, desc, and } from 'drizzle-orm'
import { generateSlug } from '@/lib/utils'
import type { PostType } from '@/types'

const ALLOWED_TYPES: PostType[] = ['poetry', 'tech', 'ideas']

function isValidPostType(value: unknown): value is PostType {
  return typeof value === 'string' && (ALLOWED_TYPES as string[]).includes(value)
}

// GET /api/posts — fetch published posts, optionally filtered by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const rawType = searchParams.get('type')
    if (rawType && !isValidPostType(rawType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post type' },
        { status: 400 }
      )
    }

    const rawLimit = parseInt(searchParams.get('limit') ?? '20')
    const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 100)

    const conditions = [eq(posts.published, true)]
    if (rawType) conditions.push(eq(posts.type, rawType))

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
// [HUMAN REVIEW NEEDED]: Currently any authenticated Supabase user can
// create posts. Add admin role verification — email allowlist, Supabase
// custom claim, or RLS policy — before production deployment.
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

    // TODO: Add admin authorization check here before production.
    // Options: ADMIN_EMAILS env var allowlist, Supabase custom claims, or RLS.

    const body = await request.json()
    const { title, type, content, excerpt, tags, metadata, published } = body

    if (!title || !type || !content) {
      return NextResponse.json(
        { success: false, error: 'title, type, and content are required' },
        { status: 400 }
      )
    }

    if (!isValidPostType(type)) {
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
