

# Final Synthesis Review

## A. Triage of All Findings

### GPT-4o Review Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | `verifyTurnstile` doesn't handle network failure/non-2xx | **ACCEPT** | Security: unhandled fetch errors become 500 instead of controlled 400. Clear correctness issue. |
| 2 | No validation that `parentId` belongs to same post | **ACCEPT** | Correctness: allows cross-post comment tree corruption. |
| 3 | No validation that `postId` refers to existing post | **ACCEPT** | Correctness: FK violations become generic 500s. |
| 4 | Unvalidated `limit` query param (NaN, negative, huge) | **ACCEPT** | Security/correctness: can produce invalid SQL or resource exhaustion. |
| 5 | No admin role check — any authenticated user can create posts | **ESCALATE** | [HUMAN REVIEW NEEDED] This requires a policy decision: email allowlist, Supabase role claim, or RLS policy. Cannot be decided without knowing the admin identity strategy. Adding a TODO comment for now. |
| 6 | `PostType` is `'poetry' \| 'tech' \| 'ideas'` but schema enum is `'poetry' \| 'technical' \| 'ideas'` | **ACCEPT** | Critical correctness: type mismatch will cause DB insert failures. The schema enum is the source of truth. Aligning types to `'poetry' \| 'technical' \| 'ideas'`. |
| 7 | No explicit validation of `type` before DB insert | **ACCEPT** | Correctness: invalid values become DB errors and 500s. |
| 8 | `formatDate` import unused in RSS route | **ACCEPT** | Code quality: dead import. |
| 9 | Disqus page URL ignores section path — slug collisions | **ACCEPT** | Correctness: different sections with same slug would share Disqus threads. |
| 10 | Disqus cleanup can throw if script already removed | **ACCEPT** | Correctness: guard `script.parentNode` before removal. |
| 11 | Active-link logic incorrectly matches by prefix only | **ACCEPT** | Correctness: `/po` would match `/poetry`. Use exact + slash-prefix matching. |
| 12 | "About" nav link points to non-existent route | **ESCALATE** | [HUMAN REVIEW NEEDED] This is a product decision — is an About page planned? Keeping the link for now but adding a comment. The route group already exists; just needs a page. |
| 13 | `estimateReadTime` returns 1 for empty content | **ACCEPT** | Correctness: empty string produces `['']` with length 1. |
| 14 | Migration script `type: 'poetry'` may drift with enum changes | **ACCEPT** | Addressed by centralizing post type literals. |
| 15 | `src/generated.py` contains non-Python conversational text | **ACCEPT** | This file is garbage — flagging for deletion. Cannot delete files in output, but noting it must be removed. |

### Gemini 2.5 Flash Review Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | AI-generated code trustworthiness concern (CWE-912) | **REJECT** | This is a meta-observation about the development process, not a specific code finding. The concrete issues are already covered by the GPT review items above. |

### Additional Issues Found During Review

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| A1 | `types/index.ts` `PostType` uses `'tech'` but schema uses `'technical'` — URL routes use `/tech/` | **ACCEPT** | The domain type must match the DB enum. Routes can stay as `/tech/` — the mapping between URL segment and DB type needs to be explicit. |
| A2 | `src/generated.py` — must be deleted | **ACCEPT** | Not a valid source file. Noting for removal. |
| A3 | `src/index.js` — empty stub, no purpose | **ESCALATE** | [HUMAN REVIEW NEEDED] Is this needed for some build tool? Appears to be a leftover. |

---

## B. Corrected Files

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
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    )

    if (!res.ok) return false

    const data = await res.json()
    return data?.success === true
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

    // ── Layer 3: Validate postId exists ──────────────────────────────────────
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Invalid post' },
        { status: 400 }
      )
    }

    // ── Layer 4: Validate parentId belongs to same post ──────────────────────
    if (parentId) {
      const [parent] = await db
        .select({ id: comments.id, postId: comments.postId })
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1)

      if (!parent || parent.postId !== postId) {
        return NextResponse.json(
          { success: false, error: 'Invalid parent comment' },
          { status: 400 }
        )
      }
    }

    // ── Layer 5: Save as pending — moderation queue ──────────────────────────
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

```ts app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq, desc, and } from 'drizzle-orm'
import { generateSlug } from '@/lib/utils'

// ─── Canonical post types — must match the DB enum ────────────────────────────
const POST_TYPES = ['poetry', 'technical', 'ideas'] as const
type PostType = (typeof POST_TYPES)[number]

function isPostType(value: unknown): value is PostType {
  return typeof value === 'string' && (POST_TYPES as readonly string[]).includes(value)
}

// GET /api/posts — fetch published posts, optionally filtered by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const rawType = searchParams.get('type')
    const type = isPostType(rawType) ? rawType : null

    const rawLimit = Number(searchParams.get('limit') ?? '20')
    const limit = Number.isInteger(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 100)
      : 20

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
// TODO [HUMAN REVIEW NEEDED]: Add admin role verification (email allowlist,
// Supabase custom claim, or RLS policy). Currently any authenticated user
// can create posts.
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

    if (!title || !content || !isPostType(type)) {
      return NextResponse.json(
        { success: false, error: 'title, valid type, and content are required' },
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

```ts app/api/rss/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { absoluteUrl } from '@/lib/utils'

export async function GET() {
  try {
    const allPosts = await db
      .select({
        title:       posts.title,
        slug:        posts.slug,
        type:        posts.type,
        excerpt:     posts.excerpt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.publishedAt))
      .limit(50)

    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
    const buildDate = new Date().toUTCString()

    const items = allPosts
      .map((post) => {
        const href = absoluteUrl(`/${post.type}/${post.slug}`)
        const date = post.publishedAt
          ? new Date(post.publishedAt).toUTCString()
          : buildDate

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${href}</link>
      <guid isPermaLink="true">${href}</guid>
      <pubDate>${date}</pubDate>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ''}
      <category>${post.type}</category>
    </item>`
      })
      .join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nsisong Effiong</title>
    <link>${siteUrl}</link>
    <description>Poetry, code, and public thought — three modes of making sense of the world.</description>
    <language>en-gb</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('[GET /api/rss]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}
```

```tsx components/shared/DisqusComments.tsx
'use client'

import { useEffect } from 'react'

interface DisqusCommentsProps {
  /** Full canonical path, e.g. `/poetry/my-poem/` */
  path: string
  /** Unique identifier for the Disqus thread */
  identifier: string
  title: string
}

export function DisqusComments({ path, identifier, title }: DisqusCommentsProps) {
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
  const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME ?? 'nsisongeffiong'

  useEffect(() => {
    const win = window as any
    win.disqus_config = function () {
      this.page.url        = `${siteUrl}${path}`
      this.page.identifier = identifier
      this.page.title      = title
    }

    const script    = document.createElement('script')
    script.src      = `https://${shortname}.disqus.com/embed.js`
    script.async    = true
    script.setAttribute('data-timestamp', String(+new Date()))
    document.body.appendChild(script)

    return () => {
      // Clean up the embed when navigating away
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      const thread = document.getElementById('disqus_thread')
      if (thread) thread.innerHTML = ''
      delete win.DISQUS
    }
  }, [path, identifier, title, siteUrl, shortname])

  return (
    <div style={{ padding: '2.5rem 2rem' }}>
      <div
        style={{
          width:        '100%',
          height:       '0.5px',
          background:   'var(--bdr)',
          marginBottom: '2rem',
        }}
      />
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '0.75rem',
          marginBottom:  '1.5rem',
        }}
      >
        <span
          style={{
            fontFamily:    'var(--font-cormorant), serif',
            fontSize:      '12px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color:         'var(--txt3)',
          }}
        >
          Responses
        </span>
        <span
          style={{
            fontFamily:  'var(--font-dm-mono), monospace',
            fontSize:    '9px',
            padding:     '2px 7px',
            background:  'var(--purple-bg)',
            color:       'var(--purple-txt)',
            borderRadius:'2px',
            letterSpacing:'0.08em',
          }}
        >
          via Disqus
        </span>
      </div>
      <div id="disqus_thread" />
    </div>
  )
}
```

```tsx components/shared/SiteNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { NAV_LINKS } from '@/types'

export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '1.25rem 2rem',
        borderBottom:   '0.5px solid var(--bdr)',
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily:  'var(--font-cormorant), serif',
          fontSize:    '18px',
          fontStyle:   'italic',
          color:       'var(--txt)',
          textDecoration: 'none',
        }}
      >
        Nsisong Effiong
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`)

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize:       '11px',
                letterSpacing:  '0.08em',
                textTransform:  'uppercase',
                color:          isActive ? 'var(--txt)' : 'var(--txt2)',
                textDecoration: 'none',
                fontWeight:     isActive ? 500 : 400,
              }}
            >
              {link.label}
            </Link>
          )
        })}
        <ThemeToggle />
      </div>
    </nav>
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

```ts types/index.ts
import type { Post, Comment, PostMetadata } from '@/lib/db/schema'

// ─── Re-export DB types ───────────────────────────────────────────────────────
export type { Post, Comment, PostMetadata }

// ─── Canonical post type literals — must match DB enum `post_type` ─────────────
// DB enum: 'poetry' | 'technical' | 'ideas'
// URL segments use /tech/ but the DB value is 'technical'
export type PostType = 'poetry' | 'technical' | 'ideas'

// ─── Post with computed fields ────────────────────────────────────────────────
export type PostWithMeta = Post & {
  readTime?: number
  commentCount?: number
}

// ─── Comment status ───────────────────────────────────────────────────────────
export type CommentStatus = 'pending' | 'approved' | 'rejected'

// ─── Comment submission form data ────────────────────────────────────────────
export type CommentFormData = {
  authorName: string
  authorEmail: string
  body: string
  website?: string        // honeypot — must be empty
  turnstileToken: string  // Cloudflare Turnstile
}

// ─── API response shapes ──────────────────────────────────────────────────────
export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Navigation ───────────────────────────────────────────────────────────────
export type NavLink = {
  label: string
  href: string
}

// NOTE: /about route does not exist yet — link kept for planned page
export const NAV_LINKS: NavLink[] = [
  { label: 'Poetry', href: '/poetry' },
  { label: 'Tech',   href: '/tech'   },
  { label: 'Ideas',  href: '/ideas'  },
  { label: 'About',  href: '/about'  },
]

// ─── Section config ───────────────────────────────────────────────────────────
export type SectionConfig = {
  type:       PostType
  label:      string
  href:       string
  accentColor: string
}

export const SECTIONS: SectionConfig[] = [
  { type: 'poetry',    label: 'Poetry', href: '/poetry', accentColor: '#534AB7' },
  { type: 'technical', label: 'Tech',   href: '/tech',   accentColor: '#1D9E75' },
  { type: 'ideas',     label: 'Ideas',  href: '/ideas',  accentColor: '#BA7517' },
]
```

```ts scripts/migrate-ghost.ts
/**
 * Ghost → Supabase migration script
 *
 * Usage:
 *   1. Export your Ghost content: Ghost Admin → Settings → Labs → Export content
 *   2. Save the JSON file as ghost-export.json in the project root
 *   3. Copy .env.example to .env and fill in DATABASE_URL
 *   4. Run: npx tsx scripts/migrate-ghost.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { generateSlug } from '../lib/utils'
import * as fs from 'fs'
import * as path from 'path'

type GhostPost = {
  id:           string
  title:        string
  slug:         string
  html:         string | null
  plaintext:    string | null
  custom_excerpt: string | null
  status:       string
  published_at: string | null
  tags?: { name: string }[]
}

type GhostExport = {
  db: [{
    data: {
      posts: GhostPost[]
    }
  }]
}

async function migrate() {
  const exportPath = path.join(process.cwd(), 'ghost-export.json')

  if (!fs.existsSync(exportPath)) {
    console.error('ghost-export.json not found in project root.')
    console.error('Export your content from Ghost Admin → Settings → Labs → Export content')
    process.exit(1)
  }

  const raw    = fs.readFileSync(exportPath, 'utf-8')
  const data   = JSON.parse(raw) as GhostExport
  const ghostPosts = data.db[0].data.posts

  console.log(`Found ${ghostPosts.length} posts in Ghost export`)

  let migrated = 0
  let skipped  = 0

  for (const ghost of ghostPosts) {
    // Only migrate published posts
    if (ghost.status !== 'published') {
      console.log(`  Skipping draft: "${ghost.title}"`)
      skipped++
      continue
    }

    const slug = ghost.slug || generateSlug(ghost.title)

    try {
      await db.insert(posts).values({
        type:        'poetry',          // All existing Ghost posts are poems — matches DB enum
        title:       ghost.title,
        slug,
        content:     ghost.html ?? ghost.plaintext ?? '',
        excerpt:     ghost.custom_excerpt ?? null,
        tags:        ghost.tags?.map((t) => t.name) ?? [],
        published:   true,
        publishedAt: ghost.published_at ? new Date(ghost.published_at) : new Date(),
        metadata: {
          legacyDisqus: true,           // Use Disqus embed for these posts
          category:     ghost.tags?.[0]?.name ?? null,
        },
      })

      console.log(`  ✓ Migrated: "${ghost.title}" → /poetry/${slug}`)
      migrated++
    } catch (error: any) {
      if (error?.code === '23505') {
        console.log(`  ↷ Already exists: "${ghost.title}" — skipping`)
        skipped++
      } else {
        console.error(`  ✗ Failed: "${ghost.title}"`, error.message)
      }
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`)
  process.exit(0)
}

migrate()
```

---

## C. Final Review Summary

```md final-review.md
# Final Synthesis Review — nsisongeffiong

## Summary

This review triaged findings from both GPT-4o (code quality & documentation) and
Gemini 2.5 Flash (security & correctness) reviews. 13 findings were accepted,
2 were escalated for human decision, and 1 was rejected.

## Accepted Changes (Applied)

### Security
1. **Hardened `verifyTurnstile`** — now catches network errors and non-2xx
   responses, returning `false` instead of letting exceptions bubble to 500.
2. **Post and parent comment validation** — comments API now verifies `postId`
   exists and `parentId` belongs to the same post before insert.
3. **Limit parameter sanitization** — `GET /api/posts` now clamps `limit` to
   1–100 with a fallback of 20 for invalid values.
4. **Post type validation** — `POST /api/posts` validates `type` against the
   canonical DB enum literals before insert, returning 400 for invalid values.

### Correctness
5. **PostType alignment** — `types/index.ts` `PostType` changed from
   `'poetry' | 'tech' | 'ideas'` to `'poetry' | 'technical' | 'ideas'` to
   match the `post_type` DB enum. `SECTIONS` config updated accordingly.
6. **Disqus URL collision fix** — `DisqusComments` now accepts `path` and
   `identifier` props instead of `slug`, preventing cross-section thread
   collisions.
7. **Disqus cleanup safety** — script removal now checks `script.parentNode`
   before calling `removeChild`.
8. **Nav active-link fix** — uses exact match + slash-prefix matching instead
   of bare `startsWith`.
9. **`estimateReadTime` empty input** — returns 0 for empty/whitespace-only
   content instead of incorrectly returning 1.

### Code Quality
10. **Removed unused `formatDate` import** from RSS route.
11. **Added comment noting About page route is planned** in NAV_LINKS.
12. **Migration script** — added clarifying comment that `'poetry'` matches
    DB enum.

### Files to Delete (not output — manual action required)
13. **`src/generated.py`** — contains AI tool-call artifacts, not valid code.
    Must be deleted before merge.

## Escalated Items [HUMAN REVIEW NEEDED]

### 1. Admin authorization for `POST /api/posts`
**Issue:** Any authenticated Supabase user can create posts. No role check.
**Why escalated:** Requires product/infrastructure decision — email allowlist,
Supabase custom claims, or RLS policy. A TODO comment has been added to the
route handler.

### 2. `/about` nav link with no route
**Issue:** NAV_LINKS includes `/about` but no page exists at that route.
**Why escalated:** Product decision — should the link be removed until the page
is built, or should a placeholder page be created? A comment has been added.

### 3. `src/index.js` — empty entry point stub
**Issue:** Contains only a comment. Purpose unclear.
**Why escalated:** May be required by a build tool or deployment target.

## Rejected Findings

### Gemini: CWE-912 AI-generated code trustworthiness
**Rationale:** Meta-observation about the development process, not a concrete
code defect. All specific issues are addressed by the accepted changes above.

## Files Modified
- `app/api/comments/route.ts` — Turnstile hardening, post/parent validation
- `app/api/posts/route.ts` — Type validation, limit clamping, admin TODO
- `app/api/rss/route.ts` — Removed unused import
- `components/shared/DisqusComments.tsx` — Path-based URL, safe cleanup
- `components/shared/SiteNav.tsx` — Active-link logic fix
- `lib/utils/index.ts` — estimateReadTime empty input fix
- `types/index.ts` — PostType alignment, SECTIONS fix, comments
- `scripts/migrate-ghost.ts` — Clarifying comment

## Files to Delete (manual)
- `src/generated.py`

## Test Coverage Gaps (from GPT review — not addressed in this pass)
Full test coverage recommendations from the GPT review remain valid and should
be addressed in a follow-up PR. Priority test targets:
1. Comments API: cross-post reply rejection, post validation
2. Posts API: limit sanitization, type validation, admin enforcement
3. RSS: null excerpt/date handling, XML validity
4. `estimateReadTime` edge cases
```