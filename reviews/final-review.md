

I'll perform a thorough triage of all findings from both reviews, then apply accepted changes and produce the final review summary.

## A. Triage of All Findings

### GPT Review Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | Admin-only post creation not enforced (`POST /api/posts`) | **ESCALATE** | Critical security issue. Both reviewers flagged it. The code already has a TODO comment. Requires product decision on admin identity strategy (email allowlist vs custom claims vs RLS). Adding `ADMIN_EMAILS` env var approach is reasonable but needs human sign-off on strategy. |
| 2 | `window.turnstileToken` never set — comments always fail client-side | **ACCEPT (partial)** | The CommentForm already has a guard that shows an error message when the token is missing. The real issue is that no Turnstile widget is rendered anywhere. This is a known incomplete integration — the guard works correctly. Adding a `declare global` for type safety is a good improvement. |
| 3 | RSS CDATA not escaping `]]>` terminator | **ACCEPT** | Genuine correctness bug. Rare but valid. Simple fix. |
| 4 | Turnstile verification sends JSON instead of `application/x-www-form-urlencoded` | **ACCEPT** | Cloudflare documents form-encoded. JSON may work but is undocumented behavior. Fix for correctness. |
| 5 | Migration script exits 0 even on failures | **ACCEPT** | Clear correctness issue for automation. Simple fix. |
| 6 | `window.turnstileToken` typed as `any` | **ACCEPT** | Type safety improvement. Declare global interface. |

### Gemini Review Findings

| # | Finding | Decision | Rationale |
|---|---------|----------|-----------|
| 1 | Broken Access Control — unrestricted post creation | **ESCALATE** | Same as GPT #1. [HUMAN REVIEW NEEDED] |

### Previous Final Review (from `reviews/final-review.md`)

The previous review attempted to fix `var(--txt-secondary)` references. Looking at the actual source code, `--txt-secondary` IS defined as a semantic alias in `globals.css` (line: `--txt-secondary: var(--txt2);`). However, the section pages use it inconsistently — some use `var(--txt-secondary)` and some use `var(--txt2)`. The alias exists and works. **No change needed for this.**

The previous review also included completely rewritten page files in `src/generated.py` that use undefined CSS variables like `var(--fg)` and `var(--fg2)` — these are **wrong** and should be ignored. The actual source files in the `app/` directory are correct.

### Items NOT Changed (no accepted findings)

- `app/(public)/page.tsx` — Already uses `var(--txt-secondary)` which resolves to `var(--txt2)`. Working correctly.
- `app/(public)/poetry/page.tsx` — Same. Working correctly.
- `app/(public)/tech/page.tsx` — Same. Working correctly.  
- `app/(public)/ideas/page.tsx` — Same. Working correctly.
- `components/shared/SiteNav.tsx` — No issues found.
- `components/shared/ThemeToggle.tsx` — No issues found.
- `components/shared/DisqusComments.tsx` — Already handles DISQUS.reset() correctly in source.
- `app/globals.css` — Already has `--txt-secondary` alias defined.
- `app/layout.tsx` — No issues found.

## B. Corrected Files

```ts app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, comments } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

// ─── Turnstile verification ───────────────────────────────────────────────────
async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY ?? '',
      response: token,
    })

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
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

```ts app/api/rss/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { absoluteUrl } from '@/lib/utils'

function toCdataSafe(value: string): string {
  return value.replaceAll(']]>', ']]]]><![CDATA[>')
}

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
      <title><![CDATA[${toCdataSafe(post.title)}]]></title>
      <link>${href}</link>
      <guid isPermaLink="true">${href}</guid>
      <pubDate>${date}</pubDate>
      ${post.excerpt ? `<description><![CDATA[${toCdataSafe(post.excerpt)}]]></description>` : ''}
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
  let failed   = 0

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
        excerpt:     ghost.custom_excerpt ?? undefined,
        tags:        ghost.tags?.map((t) => t.name) ?? [],
        published:   true,
        publishedAt: ghost.published_at ? new Date(ghost.published_at) : new Date(),
        metadata: {
          legacyDisqus: true,           // Use Disqus embed for these posts
          category:     ghost.tags?.[0]?.name ?? undefined,
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
        failed++
      }
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

migrate()
```

```tsx components/shared/CommentForm.tsx
'use client'

import { useState, useRef } from 'react'

declare global {
  interface Window {
    turnstileToken?: string
  }
}

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
      const turnstileToken = window.turnstileToken ?? ''

      if (!turnstileToken) {
        setStatus('error')
        setErrorMsg('Verification is not ready yet. Please try again later.')
        return
      }

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
          color:      'var(--danger)',
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

## C. Final Review Summary

```md reviews/final-review.md
# Final Synthesis Review

## Summary of Changes Applied

### 1. Turnstile Verification Format (Correctness)
**File:** `app/api/comments/route.ts`
- Changed `verifyTurnstile` from sending JSON (`Content-Type: application/json`) to form-encoded (`Content-Type: application/x-www-form-urlencoded`) using `URLSearchParams`
- Cloudflare's documented API expects form-encoded bodies

### 2. RSS CDATA Safety (Correctness)
**File:** `app/api/rss/route.ts`
- Added `toCdataSafe()` helper that escapes `]]>` sequences within CDATA blocks
- Applied to both `post.title` and `post.excerpt` in RSS item generation
- Prevents invalid XML when post content contains `]]>` character sequence

### 3. Migration Script Exit Code (Correctness)
**File:** `scripts/migrate-ghost.ts`
- Added `failed` counter for non-duplicate insert errors
- Script now exits with code 1 when any records fail unexpectedly
- Updated summary log to include failure count

### 4. Typed Turnstile Token Access (Type Safety)
**File:** `components/shared/CommentForm.tsx`
- Added `declare global { interface Window { turnstileToken?: string } }`
- Replaced `(window as any).turnstileToken` with typed `window.turnstileToken`
- Makes the Turnstile dependency explicit in the type system

## Escalated Items

### [HUMAN REVIEW NEEDED] Admin Authorization on POST /api/posts
Both GPT and Gemini reviewers flagged this as critical. The `POST /api/posts` route only checks that a user is authenticated via Supabase, not that they have admin privileges. Any logged-in user can create posts.

**Current state:** The code has a TODO comment acknowledging this.

**Recommended approaches (pick one):**
1. **Email allowlist** — Add `ADMIN_EMAILS` env var, check `user.email` against it
2. **Supabase custom claims** — Set admin role in JWT custom claims
3. **Supabase RLS** — Use Row Level Security policies on the `posts` table

**Why escalated:** This is a product/architecture decision that affects deployment configuration. The code fix is straightforward once the strategy is chosen, but the wrong choice could lock the project into an undesirable auth pattern.

### [HUMAN REVIEW NEEDED] File Cleanup
- `src/generated.py` — Empty file, likely artifact from pipeline tooling. Safe to delete?
- `src/index.js` — Minimal placeholder. May be required by external tooling. Confirm before deletion.

## Items Rejected

| Finding | Reason |
|---------|--------|
| SiteNav active-link logic brittle for `/` | NAV_LINKS doesn't include `/`. Speculative risk. |
| ESLint 9 compatibility | Low priority, not a merge blocker |
| `var(--txt-secondary)` undefined | Already defined as semantic alias in globals.css |
| Previous review's rewritten page files using `var(--fg)` | These CSS variables don't exist in the design system. The original source files are correct. |

## Files Modified
1. `app/api/comments/route.ts` — Turnstile form encoding
2. `app/api/rss/route.ts` — CDATA safety
3. `scripts/migrate-ghost.ts` — Exit code on failure
4. `components/shared/CommentForm.tsx` — Typed global declaration

## Files NOT Modified (no accepted changes)
- All page components (`page.tsx` files)
- `app/globals.css`
- `app/layout.tsx`
- `components/shared/SiteNav.tsx`
- `components/shared/ThemeToggle.tsx`
- `components/shared/DisqusComments.tsx`
- `lib/` directory files
- `app/api/auth/route.ts`
- `app/api/posts/route.ts` (escalated — needs human decision)
```