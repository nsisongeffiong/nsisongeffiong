import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq, desc, and } from 'drizzle-orm'
import { postTopics } from '@/lib/db/schema'
import { generateSlug } from '@/lib/utils'
import type { PostType } from '@/types'

function computeContentStats(html: string): { wordCount: number; readTime: number } {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = text ? text.split(' ').length : 0
  const readTime = Math.max(1, Math.round(wordCount / 200))
  return { wordCount, readTime }
}

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
    if (rawType && isValidPostType(rawType)) conditions.push(eq(posts.type, rawType))

    const result = await db
      .select({
        id: posts.id,
        type: posts.type,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        tags: posts.tags,
        publishedAt: posts.publishedAt,
      })
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

    // Admin authorization via email allowlist
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)

    if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, type, content, excerpt, tags, metadata, published, topicIds } = body

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

    const stats = computeContentStats(content)

    const [post] = await db
      .insert(posts)
      .values({
        title,
        type,
        slug,
        content,
        excerpt:     excerpt ?? null,
        tags:        tags ?? [],
        metadata:    { ...(metadata ?? {}), wordCount: stats.wordCount, readTime: stats.readTime },
        published:   published ?? false,
        publishedAt: published ? new Date() : null,
      })
      .returning()

    // Sync topic assignments
    if (Array.isArray(topicIds) && topicIds.length > 0) {
      await db.insert(postTopics)
        .values(topicIds.map((topicId: string) => ({ postId: post.id, topicId })))
        .onConflictDoNothing()
    }

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
