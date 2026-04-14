import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comments } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

// ─── Turnstile verification ───────────────────────────────────────────────────
async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret:   process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  )
  const data = await res.json()
  return data.success === true
}

// GET /api/comments?postId=xxx — fetch approved comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'postId is required' },
        { status: 400 }
      )
    }

    const result = await db
      .select({
        id:          comments.id,
        parentId:    comments.parentId,
        authorName:  comments.authorName,
        body:        comments.body,
        createdAt:   comments.createdAt,
      })
      .from(comments)
      .where(
        and(
          eq(comments.postId, postId),
          eq(comments.status, 'approved')
        )
      )
      .orderBy(asc(comments.createdAt))

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/comments]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/comments — submit a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      postId,
      parentId,
      authorName,
      authorEmail,
      bodyText,
      website,       // honeypot field
      turnstileToken,
    } = body

    // ── Layer 1: Honeypot check ──────────────────────────────────────────────
    // If the hidden `website` field has any value, it was filled by a bot.
    // Drop silently — don't reveal why it failed.
    if (website) {
      return NextResponse.json({ success: true, data: { pending: true } })
    }

    // ── Layer 2: Turnstile verification ──────────────────────────────────────
    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: 'Missing verification token' },
        { status: 400 }
      )
    }

    const turnstileValid = await verifyTurnstile(turnstileToken)
    if (!turnstileValid) {
      return NextResponse.json(
        { success: false, error: 'Verification failed — please try again' },
        { status: 400 }
      )
    }

    // ── Basic validation ─────────────────────────────────────────────────────
    if (!postId || !authorName?.trim() || !authorEmail?.trim() || !bodyText?.trim()) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (bodyText.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Comment is too short' },
        { status: 400 }
      )
    }

    // ── Layer 3: Save as pending — moderation queue ──────────────────────────
    const [comment] = await db
      .insert(comments)
      .values({
        postId,
        parentId:    parentId ?? null,
        authorName:  authorName.trim(),
        authorEmail: authorEmail.trim().toLowerCase(),
        body:        bodyText.trim(),
        status:      'pending',
      })
      .returning({ id: comments.id })

    return NextResponse.json(
      {
        success: true,
        data: {
          id:      comment.id,
          pending: true,
          message: 'Your comment has been submitted and will appear after moderation.',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/comments]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit comment' },
      { status: 500 }
    )
  }
}
