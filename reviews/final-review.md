

Looking at the source code carefully, I need to reconcile the reviews against the actual codebase. Let me trace through each finding methodically.

**Key observation:** The `lib/db/schema.ts` enum is `['poetry', 'tech', 'ideas']` — NOT `'technical'`. The previous review's final-review.md incorrectly changed `PostType` to `'technical'`. The DB enum, types, and routes all use `'tech'`, which is correct and consistent. The schema comment saying "Technical" is the only thing wrong — the code itself is fine.

Let me also note that the public page files (`app/(public)/page.tsx`, `poetry/page.tsx`, `tech/page.tsx`, `ideas/page.tsx`) in the source code are **empty files** (or simple stubs), not the elaborate pages shown in `src/generated.py`. The GPT review's findings about `SiteNav` imports, `var(--fg)` usage, and hardcoded hex colors all reference code that exists only in `src/generated.py`, not in the actual route files.

---

## A. Triage of All Findings

### GPT Review

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | Schema docs mention rejected `poemNumber` and "Technical" | **ACCEPT** | Comment is misleading; update to match CONTEXT.md |
| 2 | `PostType` mismatch with DB enum | **REJECT** | GPT self-corrected: schema enum IS `'tech'`, types use `'tech'` — no mismatch |
| 3 | Invalid `type` query silently ignored on GET | **ACCEPT** | Valid correctness improvement |
| 4 | Admin-only enforced by any auth user | **ESCALATE** | Requires product decision on admin identity strategy |
| 5 | Reply depth not constrained to one level | **ACCEPT** | CONTEXT.md explicitly requires one level only |
| 6 | Turnstile stubbed with no UI indication | **REJECT** | Acceptable scaffolding per CONTEXT.md; Turnstile integration is documented as current, not future |
| 7 | Ideas footer uses wrong font (Cormorant instead of Source Serif) | **ACCEPT** | Brand rule violation per CONTEXT.md |
| 8 | SiteNav imported as default in public pages | **REJECT** | The actual source files are empty/stubs — the imports exist only in `src/generated.py` which is not a real source file |
| 9 | Undefined CSS vars `--fg`/`--fg2` in public pages | **REJECT** | Same as above — only in `src/generated.py` |
| 10 | Hardcoded hex in tech page | **REJECT** | Same — only in `src/generated.py` |
| 11 | Undefined CSS vars in ideas page | **REJECT** | Same — only in `src/generated.py` |
| 12 | `lint` script may not work | **REJECT** | Low priority, not a correctness/security issue for this pass |
| 13 | `src/index.js` stub unused | **ESCALATE** | May be required by build tooling |
| 14 | Enforce one-level reply depth (code suggestion) | **ACCEPT** | Already covered by finding #5 |
| 15 | Fix SiteNav imports and text tokens | **REJECT** | Only in `src/generated.py` |
| 16 | Remove hardcoded Tech page colors | **REJECT** | Only in `src/generated.py` |
| 17 | Fix Ideas comment footer typography | **ACCEPT** | Already covered by finding #7 |
| 18 | Tighten post type validation on GET | **ACCEPT** | Already covered by finding #3 |

### Gemini Review

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | Broken Access Control — unrestricted post creation | **ESCALATE** | Same as GPT #4 — requires admin identity strategy decision |

### Previous Final Review (reviews/final-review.md)

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | Changed PostType to `'technical'` | **REJECT** | WRONG. The DB enum is `'poetry' \| 'tech' \| 'ideas'`. The previous review introduced a type mismatch that would break the entire app. |
| 2 | Changed SECTIONS config to use `'technical'` | **REJECT** | Same error as above |

---

## B. Corrected Files

```ts lib/db/schema.ts
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const postTypeEnum = pgEnum('post_type', [
  'poetry',
  'tech',
  'ideas',
])

export const commentStatusEnum = pgEnum('comment_status', [
  'pending',
  'approved',
  'rejected',
])

// ─── Posts ────────────────────────────────────────────────────────────────────

export const posts = pgTable('posts', {
  id:          uuid('id').defaultRandom().primaryKey(),
  type:        postTypeEnum('type').notNull(),
  title:       text('title').notNull(),
  slug:        text('slug').notNull().unique(),
  content:     text('content').notNull().default(''),
  excerpt:     text('excerpt'),
  tags:        text('tags').array().default([]),
  published:   boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

  /**
   * metadata jsonb — type-specific fields
   *
   * Poetry:
   *   { category: "Nature & place", poetNote: "...", legacyDisqus: true }
   *
   * Tech:
   *   { readTime: 12, featured: true, codeLanguages: ["python"], legacyDisqus: false }
   *
   * Ideas:
   *   { kicker: "Technology & governance", volume: "Vol. I", featured: true, legacyDisqus: false }
   *
   * legacyDisqus: true  → render Disqus embed (existing pre-migration posts)
   * legacyDisqus: false → render native comments (all new posts)
   */
  metadata: jsonb('metadata').$type<PostMetadata>().default({}),
})

// ─── Comments (native — for new posts) ───────────────────────────────────────

export const comments = pgTable('comments', {
  id:          uuid('id').defaultRandom().primaryKey(),
  postId:      uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  parentId:    uuid('parent_id'),              // null = top-level, uuid = reply
  authorName:  text('author_name').notNull(),
  authorEmail: text('author_email').notNull(), // stored but never displayed publicly
  body:        text('body').notNull(),
  status:      commentStatusEnum('status').notNull().default('pending'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post:    one(posts, { fields: [comments.postId], references: [posts.id] }),
  parent:  one(comments, { fields: [comments.parentId], references: [comments.id] }),
  replies: many(comments),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type Post    = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export type Comment    = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

export type PostMetadata = PoetryMetadata | TechMetadata | IdeasMetadata

export type PoetryMetadata = {
  category?:    string
  poetNote?:    string
  legacyDisqus?: boolean
}

export type TechMetadata = {
  readTime?:      number
  featured?:      boolean
  codeLanguages?: string[]
  legacyDisqus?:  boolean
}

export type IdeasMetadata = {
  kicker?:       string
  volume?:       string
  featured?:     boolean
  legacyDisqus?: boolean
}
```

```ts app/api/posts/route.ts
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
// TODO [HUMAN REVIEW NEEDED]: Currently any authenticated Supabase user can
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
```

```ts app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, comments } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

// ─── Turnstile verification ───────────────────────────────────────────────────
async function verifyTurnstile(token: string): Promise<boolean> {
  try {
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
    if (!res.ok) return false
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
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

    // ── Validate postId refers to a real published post ───────────────────────
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.published, true)))
      .limit(1)

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // ── Validate parentId belongs to the same post & enforce one-level depth ──
    if (parentId) {
      const [parent] = await db
        .select({
          id:       comments.id,
          postId:   comments.postId,
          parentId: comments.parentId,
        })
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1)

      if (!parent || parent.postId !== postId) {
        return NextResponse.json(
          { success: false, error: 'Invalid parent comment' },
          { status: 400 }
        )
      }

      // One level of replies only — reject if parent is itself a reply
      if (parent.parentId) {
        return NextResponse.json(
          { success: false, error: 'Replies are limited to one level' },
          { status: 400 }
        )
      }
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
```

```tsx components/shared/CommentForm.tsx
'use client'

import { useState, useRef } from 'react'

interface CommentFormProps {
  postId:   string
  parentId?: string | null
  section:  'poetry' | 'tech' | 'ideas'
  onSuccess?: () => void
  onCancel?:  () => void
}

export function CommentForm({
  postId,
  parentId,
  section,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [body,     setBody]     = useState('')
  const [status,   setStatus]   = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const honeypotRef = useRef<HTMLInputElement>(null)

  const isPoetry = section === 'poetry'
  const isTech   = section === 'tech'
  const isIdeas  = section === 'ideas'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      // Get Turnstile token — widget renders via script in page
      // For now we pass an empty string; the script integration
      // will populate window.turnstileToken before submit
      const turnstileToken = (window as any).turnstileToken ?? ''

      const res = await fetch('/api/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId:       parentId ?? null,
          authorName:     name.trim(),
          authorEmail:    email.trim(),
          bodyText:       body.trim(),
          website:        honeypotRef.current?.value ?? '', // honeypot
          turnstileToken,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      setName('')
      setEmail('')
      setBody('')
      onSuccess?.()
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <p style={{
        fontFamily:  isPoetry ? 'var(--font-cormorant), serif' : isIdeas ? 'var(--font-source-serif), serif' : 'var(--font-dm-mono), monospace',
        fontSize:    isPoetry ? '15px' : '13px',
        fontStyle:   isPoetry || isIdeas ? 'italic' : 'normal',
        color:       'var(--txt2)',
        textAlign:   isPoetry || isIdeas ? 'center' : 'left',
        padding:     '1rem 0',
      }}>
        {isPoetry || isIdeas
          ? 'Your response has been submitted and will appear after moderation. Thank you.'
          : '// comment submitted. it will appear after moderation.'}
      </p>
    )
  }

  const labelStyle: React.CSSProperties = {
    fontFamily:    isPoetry
                     ? 'var(--font-cormorant), serif'
                     : isIdeas
                       ? 'var(--font-syne), sans-serif'
                       : 'var(--font-dm-mono), monospace',
    fontSize:      '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color:         'var(--txt3)',
    display:       'block',
    marginBottom:  '0.35rem',
    fontWeight:    isIdeas ? 600 : 400,
  }

  const inputStyle: React.CSSProperties = isPoetry || isIdeas ? {
    fontFamily:    isPoetry ? 'var(--font-cormorant), serif' : 'var(--font-source-serif), serif',
    fontSize:      '15px',
    fontStyle:     'italic',
    padding:       '0.6rem 0',
    border:        'none',
    borderBottom:  '0.5px solid var(--bdr2)',
    background:    'transparent',
    color:         'var(--txt)',
    outline:       'none',
    width:         '100%',
  } : {
    fontFamily:   'var(--font-dm-mono), monospace',
    fontSize:     '12px',
    padding:      '0.5rem 0.75rem',
    border:       '0.5px solid var(--bdr2)',
    borderRadius: '3px',
    background:   'var(--bg2)',
    color:        'var(--txt)',
    outline:      'none',
    width:        '100%',
  }

  const submitStyle: React.CSSProperties = isPoetry ? {
    fontFamily:    'var(--font-cormorant), serif',
    fontSize:      '12px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color:         'var(--purple)',
    background:    'none',
    border:        '0.5px solid var(--purple-acc)',
    padding:       '0.65rem 2rem',
    cursor:        'pointer',
    display:       'block',
    margin:        '0 auto',
  } : isIdeas ? {
    fontFamily:    'var(--font-syne), sans-serif',
    fontSize:      '11px',
    fontWeight:    700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    background:    'none',
    border:        '0.5px solid var(--amber)',
    color:         'var(--amber)',
    padding:       '0.7rem 2rem',
    cursor:        'pointer',
  } : {
    fontFamily:    'var(--font-dm-mono), monospace',
    fontSize:      '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    background:    'var(--teal-hero)',
    color:         'var(--teal-light)',
    border:        'none',
    padding:       '0.6rem 1.5rem',
    cursor:        'pointer',
    borderRadius:  '3px',
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot — hidden from real users, visible to bots */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isPoetry || isIdeas ? 'Your name' : 'your name'}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isPoetry || isIdeas ? 'your@email.com' : 'your@email.com'}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          {isTech ? 'Comment' : 'Response'}
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            isPoetry ? 'Write something...'
            : isTech  ? 'your comment...'
            :            'Your response...'
          }
          required
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
        />
      </div>

      {errorMsg && (
        <p style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize:   '12px',
          color:      'var(--color-text-danger, #E24B4A)',
          marginBottom: '1rem',
        }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{
          ...submitStyle,
          opacity: status === 'submitting' ? 0.6 : 1,
        }}
      >
        {status === 'submitting'
          ? (isTech ? '$ submitting...' : 'Submitting...')
          : (isTech ? '$ submit' : isPoetry ? 'Submit' : 'Submit response')}
      </button>

      <p style={{
        fontFamily: isPoetry
          ? 'var(--font-cormorant), serif'
          : isIdeas
            ? 'var(--font-source-serif), serif'
            : 'var(--font-dm-mono), monospace',
        fontSize:    isPoetry || isIdeas ? '12px' : '10px',
        fontStyle:   isPoetry || isIdeas ? 'italic' : 'normal',
        color:       'var(--txt3)',
        textAlign:   isPoetry ? 'center' : 'left',
        marginTop:   '0.85rem',
        letterSpacing: isTech ? '0.06em' : 'normal',
      }}>
        {isTech
          ? 'email hidden publicly · comments moderated before publishing'
          : isIdeas
            ? 'Your email is never displayed publicly. All responses are moderated.'
            : 'Your email is never displayed publicly · Comments are moderated'}
      </p>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border:     'none',
            color:      'var(--txt3)',
            cursor:     'pointer',
            fontSize:   '12px',
            marginTop:  '0.5rem',
          }}
        >
          Cancel
        </button>
      )}
    </form>
  )
}
```

```ts lib/utils/index.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import slugify from 'slugify'

// ─── Tailwind class merging ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Slug generation ──────────────────────────────────────────────────────────
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  })
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMMM d, yyyy')
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// ─── Read time estimate ───────────────────────────────────────────────────────
export function estimateReadTime(content: string): number {
  const trimmed = content.trim()
  if (!trimmed) return 0

  const wordsPerMinute = 200
  const wordCount = trimmed.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / wordsPerMinute))
}

// ─── Truncate text ────────────────────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

// ─── Absolute URL ─────────────────────────────────────────────────────────────
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
  return `${base}${path}`
}
```

## C. Final Review Summary

```md reviews/final-review.md
# Final Synthesis Review — nsisongeffiong

## Summary

This review triaged findings from GPT-4o (code quality & documentation) and
Gemini 2.5 Flash (security & correctness) reviews, plus corrected errors
introduced by the previous Stage 4 synthesis that would have broken the app.

## Critical Correction

**The previous final review incorrectly changed `PostType` from `'tech'` to
`'technical'`.** The DB enum in `lib/db/schema.ts` uses `'tech'`, all routes
use `/tech/`, and the CONTEXT.md specifies the section is called "Tech". The
previous review confused a comment that said "Technical" with the actual enum
value. This change has been reverted.

## Accepted Changes (Applied)

### Security & Correctness
1. **Post type validation on GET** — `GET /api/posts` now rejects invalid
   `type` query params with 400 instead of silently ignoring them.
2. **Post type validation on POST** — `POST /api/posts` validates `type`
   against allowed literals before insert.
3. **One-level reply depth enforcement** — Comments API now fetches
   `parent.parentId` and rejects replies to replies with 400.
4. **Limit parameter sanitization** — `GET /api/posts` clamps limit to
   1–100 with fallback of 20 for NaN.

### Code Quality
5. **Schema metadata comment** — Removed rejected `poemNumber` field and
   changed "Technical" to "Tech" in the JSDoc comment to match CONTEXT.md.
6. **Removed `PoetryMetadata.poemNumber`** — Type no longer includes the
   rejected field.
7. **Renamed `TechnicalMetadata` to `TechMetadata`** — Consistent with
   "Tech" naming convention throughout.
8. **`estimateReadTime` empty input** — Returns 0 for empty/whitespace-only
   content instead of 1.

### Brand Fidelity
9. **Ideas comment footer typography** — Split the font-family branch so
   Ideas section uses `var(--font-source-serif), serif` instead of
   incorrectly sharing Cormorant with Poetry.

## Escalated Items [HUMAN REVIEW NEEDED]

### 1. Admin authorization for `POST /api/posts`
**Issue:** Any authenticated Supabase user can create posts. No role check.
**Why escalated:** Requires product/infrastructure decision — email allowlist,
Supabase custom claims, or RLS policy. A TODO comment has been added to the
route handler.
**Action needed:** Decide admin identity strategy and implement before
production deployment.

### 2. `src/index.js` — empty entry point stub
**Issue:** Contains only a comment. Purpose unclear.
**Why escalated:** May be required by a build tool or deployment target.
**Action needed:** Confirm whether this file is needed; delete if not.

### 3. `src/generated.py` — AI artifact file
**Issue:** Contains what appears to be the full page components for all
public pages, but as a Python file in `src/`. This is not a valid source
file and should not be committed.
**Action needed:** Delete this file. If the page implementations it contains
are desired, extract them into proper `.tsx` files in the `app/` directory.

## Rejected Findings

| Finding | Rationale |
|---------|-----------|
| Previous review's PostType → 'technical' change | DB enum is `'tech'`, not `'technical'`. This would have broken all post queries. |
| SiteNav default import errors on public pages | The actual source files are empty stubs; the imports only exist in `src/generated.py` |
| `var(--fg)` / `var(--fg2)` undefined on public pages | Same — only in `src/generated.py`, not in actual route files |
| Hardcoded hex on tech page | Same — only in `src/generated.py` |
| Gemini CWE-912 AI trustworthiness | Meta-observation, not a concrete code defect |
| Turnstile stub needs UI indication | Acceptable scaffolding per CONTEXT.md |
| `next lint` script may not work | Low priority, not a merge blocker |

## Files Modified
- `lib/db/schema.ts` — Fixed metadata comment, removed `poemNumber`, renamed `TechnicalMetadata` → `TechMetadata`
- `app/api/posts/route.ts` — Type validation, limit clamping, admin TODO
- `app/api/comments/route.ts` — One-level reply depth enforcement
- `components/shared/CommentForm.tsx` — Ideas footer font fix
- `lib/utils/index.ts` — `estimateReadTime` empty input fix

## Files NOT Modified (no accepted changes)
- `types/index.ts` — PostType is correctly `'tech'`, no change needed
- `app/(public)/page.tsx` — Empty stub, no SiteNav import to fix
- `app/(public)/poetry/page.tsx` — Empty file
- `app/(public)/tech/page.tsx` — Empty file
- `app/(public)/ideas/page.tsx` — Empty file
- `components/shared/SiteNav.tsx` — No changes needed
- `components/shared/DisqusComments.tsx` — No changes needed
- `app/api/rss/route.ts` — No changes needed (formatDate is not imported)

## Files to Delete (manual action required)
- `src/generated.py` — AI artifact, not valid source code
- `src/index.js` — Likely unused stub (confirm before deleting)
```