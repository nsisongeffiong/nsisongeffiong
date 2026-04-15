I'll perform a thorough triage of all findings from both reviews, then apply accepted changes and produce the final review document.

## A. Triage of All Findings

| # | Source | Finding | Decision | Rationale |
|---|--------|---------|----------|-----------|
| 1 | GPT | `drizzle.config.ts` uses `DATABASE_URL_POOLED` but comment says direct | **ACCEPT** | Clear bug — comment and `.env.example` both say direct, code uses pooled. Pooled connections can fail for migrations. |
| 2 | GPT | `GET /api/posts` returns full content for listings | **ACCEPT** | Good hygiene — narrow the select to listing fields only. |
| 3 | GPT | `POST /api/posts` open to any authenticated user | **ESCALATE** | Critical security gap. Requires architecture decision. Both reviewers flagged. |
| 4 | GPT | Turnstile verification runs before basic validation | **ACCEPT** | Wastes external API calls on obviously invalid payloads. Reorder to validate first. |
| 5 | GPT | Parent comment lookup doesn't check status | **ACCEPT** | Replies to rejected/pending parents create inconsistent state. Add status check. |
| 6 | GPT | `window.turnstileToken` — no widget rendered | **REJECT** | Known incomplete feature. Guard logic correctly prevents submission. |
| 7 | GPT | Turnstile token not rotated after submit | **REJECT** | Part of the incomplete Turnstile integration. |
| 8 | GPT | `dangerouslySetInnerHTML` in ideas/[slug] | **ESCALATE** | Safe now (hardcoded data) but must be addressed before DB-backed content. |
| 9 | GPT | Inconsistent inline slug generation across pages | **ACCEPT** | Poetry uses `.replace(/ /g, '-')`, ideas uses regex, tech uses `.replace(/ /g, '-')`. Use shared `generateSlug`. |
| 10 | GPT | Login page doesn't check `res.ok` before `.json()` | **ACCEPT** | Non-JSON error responses will throw and mask real issues. |
| 11 | GPT | Admin sign-out ignores response status | **ACCEPT** | Failed sign-out leaves session intact but navigates away. |
| 12 | GPT | `next lint` compatibility with ESLint 9 | **REJECT** | Low priority, not a merge blocker. |
| 13 | GPT | `next@15.0.0` has security vulnerability | **ESCALATE** | Package upgrade requires testing. |
| 14 | GPT | `.gitignore` has duplicate/redundant entries | **ACCEPT** | Clean up confusion. |
| 15 | GPT | No tests provided | **REJECT** | Valid concern but test writing is a separate task, not a code fix. |
| 16 | Gemini | XSS via `dangerouslySetInnerHTML` | **ESCALATE** | Same as #8. |
| 17 | Gemini | Broken access control on POST /api/posts | **ESCALATE** | Same as #3. |
| 18 | Gemini | `next@15.0.0` vulnerable | **ESCALATE** | Same as #13. |
| 19 | GPT | Hardcoded hex `#E1F5EE` and `#9FE1CB` in tech/[slug] | **ACCEPT** | Should use CSS variables for dark mode support. |
| 20 | GPT | Poetry `commentCount` hardcoded vs derived | **ACCEPT** | Should derive from rendered data like ideas page does. |
| 21 | GPT | Local `slugify()` in tech/[slug] duplicates shared logic | **ACCEPT** | Part of finding #9. |

## B. Corrected Files

```ts drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema:    './lib/db/schema.ts',
  out:       './drizzle/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    // Use direct connection (not pooled) for migrations
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict:  true,
})
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

    // ── Layer 2: Basic validation (before external calls) ────────────────────
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

    // ── Layer 3: Turnstile verification ──────────────────────────────────────
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
          status:   comments.status,
        })
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1)

      if (!parent || parent.postId !== postId || parent.status !== 'approved') {
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

    // ── Layer 4: Save as pending — moderation queue ──────────────────────────
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

```tsx app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data: { success?: boolean; error?: string } = {}
      try {
        data = await res.json()
      } catch {
        setError('Authentication failed')
        return
      }

      if (res.ok && data.success === true) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg2)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg)',
          border: '0.5px solid var(--bdr)',
          borderRadius: '4px',
          padding: '2.5rem',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '20px',
            fontStyle: 'italic',
            color: 'var(--txt)',
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          nsisongeffiong.com
        </a>

        <span
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--txt3)',
            display: 'block',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          Admin
        </span>

        <hr
          style={{
            width: '100%',
            height: '0.5px',
            background: 'var(--bdr)',
            marginBottom: '1.5rem',
            border: 'none',
          }}
        />

        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="email"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '13px',
              padding: '0.6rem 0.75rem',
              border: '0.5px solid var(--bdr2)',
              borderRadius: '3px',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="password"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '13px',
              padding: '0.6rem 0.75rem',
              border: '0.5px solid var(--bdr2)',
              borderRadius: '3px',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              color: 'var(--danger)',
              marginBottom: '1rem',
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            background: 'var(--teal-hero)',
            color: 'var(--teal-light)',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '3px',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
```

```tsx components/admin/AdminNav.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Posts', href: '/admin/posts' },
  { label: 'Comments', href: '/admin/comments' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signOutError, setSignOutError] = useState(false);

  const handleSignOut = async () => {
    setSignOutError(false);
    const res = await fetch('/api/auth', { method: 'DELETE' });

    if (!res.ok) {
      setSignOutError(true);
      return;
    }

    router.push('/admin/login');
  };

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 220,
        height: '100vh',
        background: 'var(--bg2)',
        borderRight: '0.5px solid var(--bdr)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        zIndex: 100,
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 17,
          fontStyle: 'italic',
          color: 'var(--txt)',
          textDecoration: 'none',
          padding: '0 1.5rem',
          marginBottom: '0.35rem',
          display: 'block',
        }}
      >
        nsisongeffiong.com
      </Link>

      <span
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--txt3)',
          padding: '0 1.5rem',
          marginBottom: '1.5rem',
          display: 'block',
        }}
      >
        Admin
      </span>

      <hr
        style={{
          height: '0.5px',
          background: 'var(--bdr)',
          marginBottom: '1.5rem',
          border: 'none',
        }}
      />

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '0.6rem 1.5rem',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderLeft: isActive
                  ? '2px solid var(--teal-mid)'
                  : '2px solid transparent',
                color: isActive ? 'var(--teal-mid)' : 'var(--txt2)',
                background: isActive ? 'var(--bg3)' : 'none',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {signOutError && (
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 10,
            color: 'var(--danger)',
            padding: '0 1.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Sign out failed. Try again.
        </p>
      )}

      <button
        onClick={handleSignOut}
        type="button"
        style={{
          margin: '1.5rem',
          width: 'calc(100% - 3rem)',
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background: 'none',
          border: '0.5px solid var(--bdr2)',
          color: 'var(--txt3)',
          padding: '0.6rem',
          borderRadius: 3,
          cursor: 'pointer',
        }}
      >
        ← Sign out
      </button>
    </aside>
  );
}
```

```tsx app/(public)/poetry/page.tsx
import { SiteNav } from '@/components/shared/SiteNav';
import { generateSlug } from '@/lib/utils';

const categories = [
  'All',
  'Nature & place',
  'Memory',
  'Language & form',
  'Grief',
  'Politics',
];

const featuredPoem = {
  title: 'The River Remembers',
  excerpt:
    'A meditation on how water holds the stories we drop into it — the baptisms, the crossings, the names spoken once and carried downstream forever.',
  verse: `The river remembers what the mouth forgets—\nhow your name tasted before the renaming,\nhow the current held you\nthe way a vowel holds breath\nbefore it breaks into song.`,
  category: 'Memory',
  date: '2024-12-15',
};

const poems = [
  {
    title: 'Cartography of Silence',
    excerpt:
      'Where the map ends, the body begins — tracing the borders that no surveyor drew.',
    date: '2024-11-28',
    category: 'Nature & place',
  },
  {
    title: 'After the Rains',
    excerpt:
      'What remains when the storm has spoken — the grammar of wet earth and unfinished prayer.',
    date: '2024-11-10',
    category: 'Grief',
  },
  {
    title: 'Syntax of Return',
    excerpt:
      'A poem about coming home to a language that no longer fits the mouth that left.',
    date: '2024-10-22',
    category: 'Language & form',
  },
  {
    title: 'The Weight of Provinces',
    excerpt:
      'On borders drawn with rulers on tables far from the land they divided.',
    date: '2024-10-05',
    category: 'Politics',
  },
];

export default function PoetryPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--txt)',
      }}
    >
      <SiteNav />

      {/* ── Hero ── */}
      <section
        style={{
          textAlign: 'center',
          padding: '5rem 1.5rem 3rem',
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(3rem, 7vw, 5rem)',
            lineHeight: 1.05,
            color: 'var(--txt)',
            marginBottom: '1rem',
          }}
        >
          Poetry
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '1.15rem',
            color: 'var(--txt-secondary)',
            lineHeight: 1.6,
          }}
        >
          Verses on memory, landscape, and the silence between words — each poem
          a small act of naming.
        </p>
      </section>

      {/* ── Category Filter ── */}
      <nav
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '0 1.5rem 2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {categories.map((cat, i) => (
          <button
            key={cat}
            type="button"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: i === 0 ? 'var(--purple-acc)' : 'transparent',
              color: i === 0 ? 'var(--bg)' : 'var(--txt-secondary)',
              border:
                i === 0
                  ? '1px solid var(--purple-acc)'
                  : '1px solid var(--bdr)',
              borderRadius: '2px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* ── Featured Poem ── */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg2)',
            padding: '2.5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2.5rem',
          }}
        >
          {/* Left: Title & excerpt */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--purple-acc)',
              }}
            >
              Featured
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '2rem',
                lineHeight: 1.15,
                color: 'var(--txt)',
              }}
            >
              {featuredPoem.title}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--txt-secondary)',
              }}
            >
              {featuredPoem.excerpt}
            </p>
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--purple-acc)',
                border: '1px solid var(--purple-acc)',
                padding: '0.15rem 0.5rem',
                borderRadius: '2px',
                alignSelf: 'flex-start',
              }}
            >
              {featuredPoem.category}
            </span>
          </div>

          {/* Right: Verse excerpt */}
          <div
            style={{
              borderLeft: '3px solid var(--purple-acc)',
              paddingLeft: '1.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '1.1rem',
                lineHeight: 1.9,
                color: 'var(--txt)',
                whiteSpace: 'pre-line',
              }}
            >
              {featuredPoem.verse}
            </p>
          </div>
        </div>
      </section>

      {/* ── Poem Card Grid ── */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 1.5rem 5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {poems.map((poem) => (
          <article
            key={poem.title}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingBottom: '2rem',
              borderBottom: '0.5px solid var(--bdr)',
            }}
          >
            {/* Ornamental dots */}
            <span
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '1rem',
                letterSpacing: '0.5em',
                color: 'var(--purple-acc)',
                userSelect: 'none',
              }}
              aria-hidden="true"
            >
              · · ·
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '1.5rem',
                lineHeight: 1.2,
                color: 'var(--txt)',
              }}
            >
              <a
                href={`/poetry/${generateSlug(poem.title)}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {poem.title}
              </a>
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--txt-secondary)',
              }}
            >
              {poem.excerpt}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
              }}
            >
              <time
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  color: 'var(--txt-secondary)',
                }}
                dateTime={poem.date}
              >
                {new Date(poem.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--purple-acc)',
                  border: '1px solid var(--purple-acc)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '2px',
                }}
              >
                {poem.category}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
```

```tsx app/(public)/tech/page.tsx
import { SiteNav } from '@/components/shared/SiteNav';
import { generateSlug } from '@/lib/utils';

const filters = ['all', 'AI/ML', 'systems', 'web', 'devtools'];

const articles = [
  {
    num: '01',
    tag: 'AI/ML',
    title: 'Building Resilient ML Pipelines at Scale',
    excerpt:
      'How to design machine learning infrastructure that survives the chaos of production — retry semantics, circuit breakers, and graceful degradation.',
    date: '2024-12-10',
    readTime: '12 min',
  },
  {
    num: '02',
    tag: 'systems',
    title: 'Event Sourcing Beyond the Hype',
    excerpt:
      'A practical look at when event sourcing works, when it doesn\'t, and what the blog posts leave out about schema evolution.',
    date: '2024-11-22',
    readTime: '9 min',
  },
  {
    num: '03',
    tag: 'web',
    title: 'Server Components and the Death of the Waterfall',
    excerpt:
      'React Server Components fundamentally change how we think about data fetching. Here\'s a migration path that won\'t break your app.',
    date: '2024-11-05',
    readTime: '8 min',
  },
];

const stats = [
  { label: 'articles published', value: '24' },
  { label: 'avg words', value: '2,400' },
  { label: 'topics covered', value: '6' },
];

export default function TechPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--txt)',
      }}
    >
      <SiteNav />

      {/* ── Hero ── */}
      <section
        style={{
          background: 'var(--teal-hero)',
          padding: '4rem 1.5rem 3.5rem',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.8rem',
              color: 'var(--teal-mid)',
              marginBottom: '0.5rem',
            }}
          >
            # engineering blog
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontWeight: 400,
              fontSize: 'clamp(2.4rem, 6vw, 3.5rem)',
              lineHeight: 1.1,
              color: 'var(--teal-txt)',
              marginBottom: '1rem',
            }}
          >
            ./tech
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              color: 'var(--teal-txt)',
              maxWidth: '560px',
              marginBottom: '1.5rem',
              opacity: 0.85,
            }}
          >
            Deep dives into AI/ML systems, web infrastructure, and the developer
            tools that make complex work feel simple.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['AI/ML', 'systems', 'web', 'devtools'].map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  border: '1px solid var(--teal-mid)',
                  color: 'var(--teal-mid)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '2px',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter Chips ── */}
      <nav
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '2rem 1.5rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {filters.map((f, i) => (
          <button
            key={f}
            type="button"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: i === 0 ? 'var(--teal-hero)' : 'transparent',
              color: i === 0 ? 'var(--teal-mid)' : 'var(--txt-secondary)',
              border:
                i === 0
                  ? '1px solid var(--teal-hero)'
                  : '1px solid var(--bdr)',
              borderRadius: '2px',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </nav>

      {/* ── Article List ── */}
      <section
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '1rem 1.5rem 4rem',
        }}
      >
        {articles.map((a) => (
          <article
            key={a.num}
            style={{
              display: 'grid',
              gridTemplateColumns: '3rem 1fr',
              gap: '1.5rem',
              padding: '2rem 0',
              borderBottom: '0.5px solid var(--bdr)',
            }}
          >
            {/* Number */}
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '1.5rem',
                fontWeight: 400,
                color: 'var(--teal-mid)',
                lineHeight: 1,
                paddingTop: '0.15rem',
              }}
            >
              {a.num}
            </span>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--teal-hero)',
                  border: '1px solid var(--teal-hero)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '2px',
                  alignSelf: 'flex-start',
                }}
              >
                {a.tag}
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontWeight: 700,
                  fontSize: '1.35rem',
                  lineHeight: 1.25,
                  color: 'var(--txt)',
                }}
              >
                <a
                  href={`/tech/${generateSlug(a.title)}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {a.title}
                </a>
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.7,
                  color: 'var(--txt-secondary)',
                }}
              >
                {a.excerpt}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  color: 'var(--txt-secondary)',
                }}
              >
                <time dateTime={a.date}>
                  {new Date(a.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
                <span>{a.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ── Stats Bar ── */}
      <section
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '0.5px solid var(--bdr)',
            borderBottom: '0.5px solid var(--bdr)',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                borderRight:
                  i < stats.length - 1 ? '0.5px solid var(--bdr)' : 'none',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '2rem',
                  fontWeight: 400,
                  color: 'var(--teal-mid)',
                  marginBottom: '0.35rem',
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--txt-secondary)',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

```tsx app/(public)/tech/[slug]/page.tsx
import { SiteNav } from '@/components/shared/SiteNav';
import { CommentForm } from '@/components/shared/CommentForm';
import { generateSlug } from '@/lib/utils';

/* ── static placeholder data ── */
const post = {
  id: 'placeholder-id',
  slug: 'building-a-comment-system-with-drizzle-and-supabase',
  title: 'Building a Comment System with Drizzle & Supabase',
  description: 'A walkthrough of the moderation pipeline, honeypot fields, and Turnstile integration for a spam-free comment system.',
  tags: ['Drizzle', 'Supabase', 'Next.js', 'TypeScript'],
  author: 'Nsisong Effiong',
  date: '28 Feb 2024',
  readTime: '8 min read',
  body: [
    {
      type: 'paragraph' as const,
      text: 'The comment system for this site needed to balance simplicity with resilience. I wanted no client-side JavaScript dependencies for rendering comments, server-side moderation by default, and strong spam prevention without CAPTCHAs.',
    },
    {
      type: 'heading' as const,
      text: 'Schema Design',
    },
    {
      type: 'paragraph' as const,
      text: 'Every comment is stored with a status field that defaults to pending. Only approved comments are returned in public queries. The schema uses Drizzle ORM with a PostgreSQL backend on Supabase.',
    },
    {
      type: 'code' as const,
      language: 'typescript',
      text: `export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postSlug: varchar('post_slug', { length: 255 }).notNull(),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  body: text('body').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});`,
    },
    {
      type: 'heading' as const,
      text: 'Honeypot Fields',
    },
    {
      type: 'paragraph' as const,
      text: 'A hidden field named website is included in the form. Bots that fill it in receive a fake success response. The server never writes their data to the database.',
    },
    {
      type: 'callout' as const,
      label: '// note',
      text: 'The honeypot check runs before Turnstile verification to save API calls on obvious bot submissions.',
    },
    {
      type: 'heading' as const,
      text: 'Turnstile Integration',
    },
    {
      type: 'paragraph' as const,
      text: 'After the honeypot check passes, the server verifies the Cloudflare Turnstile token. Only then does the comment get written to the database with pending status.',
    },
  ],
  toc: [
    { id: 'schema-design', label: 'Schema Design' },
    { id: 'honeypot-fields', label: 'Honeypot Fields' },
    { id: 'turnstile-integration', label: 'Turnstile Integration' },
  ],
  related: [
    { slug: 'drizzle-orm-patterns', title: 'Drizzle ORM Patterns' },
    { slug: 'nextjs-middleware-auth', title: 'Next.js Middleware Auth' },
  ],
  commentCount: 5,
};

const prevPost = {
  slug: 'drizzle-orm-patterns',
  title: 'Drizzle ORM Patterns',
};

const nextPost = {
  slug: 'nextjs-middleware-auth',
  title: 'Next.js Middleware Auth',
};

const comments: Array<{
  id: string;
  name: string;
  initials: string;
  date: string;
  body: string;
  replies: Array<{
    id: string;
    name: string;
    initials: string;
    date: string;
    body: string;
  }>;
}> = [
  {
    id: '1',
    name: 'Chidi Anagonye',
    initials: 'CA',
    date: '01 Mar 2024',
    body: 'Clean approach. Have you considered adding rate limiting per IP as an additional layer before the Turnstile check?',
    replies: [
      {
        id: '1a',
        name: 'Nsisong Effiong',
        initials: 'NE',
        date: '01 Mar 2024',
        body: 'Yes — that is on the roadmap. Vercel edge middleware makes it straightforward with the @vercel/kv rate limiter.',
      },
    ],
  },
  {
    id: '2',
    name: 'Amaka Obi',
    initials: 'AO',
    date: '03 Mar 2024',
    body: 'The fake success response for honeypot hits is clever. Bots never learn they have been caught.',
    replies: [],
  },
];

export default function TechSinglePage() {
  return (
    <>
      <SiteNav />

      <main
        style={{
          color: 'var(--txt)',
          background: 'var(--bg)',
          minHeight: '100vh',
        }}
      >
        {/* ── back link / breadcrumb ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 960,
            margin: '0 auto',
            padding: '1.5rem 2rem 0',
          }}
        >
          <a
            href="/tech"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.8rem',
              color: 'var(--txt2)',
              textDecoration: 'none',
            }}
          >
            ← ~/tech
          </a>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--teal-mid)',
              maxWidth: '60%',
              textAlign: 'right',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.title}
          </span>
        </div>

        {/* ── hero ── */}
        <div
          style={{
            background: 'var(--teal-hero)',
            padding: '2.5rem 2rem',
            marginTop: '1rem',
          }}
        >
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            {/* tags */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.04em',
                    color: 'var(--teal-comm)',
                    border: '1px solid var(--teal-comm)',
                    borderRadius: 3,
                    padding: '0.2rem 0.55rem',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* title */}
            <h1
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontWeight: 700,
                fontSize: '2.125rem',
                lineHeight: 1.2,
                color: 'var(--teal-pale)',
                margin: '0 0 0.75rem',
              }}
            >
              {post.title}
            </h1>

            {/* description */}
            <p
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--teal-light)',
                margin: '0 0 1.25rem',
                maxWidth: 640,
              }}
            >
              {post.description}
            </p>

            {/* meta row */}
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '0.7rem',
                color: 'var(--teal-comm)',
                display: 'flex',
                gap: '1.25rem',
              }}
            >
              <span>{post.date}</span>
              <span>{post.readTime}</span>
              <span>{post.author}</span>
            </div>
          </div>
        </div>

        {/* ── two-column body ── */}
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '2.5rem 2rem',
            display: 'flex',
            gap: '2.5rem',
            alignItems: 'flex-start',
          }}
        >
          {/* article column */}
          <article style={{ flex: 1, minWidth: 0 }}>
            {post.body.map((block, i) => {
              if (block.type === 'heading') {
                const id = generateSlug(block.text);
                return (
                  <h2
                    key={i}
                    id={id}
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      color: 'var(--txt)',
                      margin: '2rem 0 0.75rem',
                    }}
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'paragraph') {
                return (
                  <p
                    key={i}
                    style={{
                      fontFamily: 'var(--font-syne), sans-serif',
                      fontSize: '0.875rem',
                      lineHeight: 1.8,
                      color: 'var(--txt2)',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    {block.text}
                  </p>
                );
              }

              if (block.type === 'code') {
                return (
                  <pre
                    key={i}
                    style={{
                      background: 'var(--teal-hero)',
                      color: 'var(--teal-light)',
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '0.6875rem',
                      lineHeight: 1.7,
                      padding: '1.25rem 1.5rem',
                      borderRadius: 4,
                      overflow: 'auto',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    <code>{block.text}</code>
                  </pre>
                );
              }

              if (block.type === 'callout') {
                return (
                  <div
                    key={i}
                    style={{
                      borderLeft: '3px solid var(--teal-mid)',
                      background: 'var(--bg2)',
                      padding: '1rem 1.25rem',
                      margin: '0 0 1.25rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '0.65rem',
                        color: 'var(--teal-mid)',
                        display: 'block',
                        marginBottom: '0.35rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {block.label}
                    </span>
                    <p
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '0.8rem',
                        lineHeight: 1.65,
                        color: 'var(--txt2)',
                        margin: 0,
                      }}
                    >
                      {block.text}
                    </p>
                  </div>
                );
              }

              return null;
            })}
          </article>

          {/* sidebar */}
          <aside
            style={{
              width: 185,
              flexShrink: 0,
              position: 'sticky',
              top: '2rem',
            }}
          >
            {/* ToC */}
            <div
              style={{
                background: 'var(--bg2)',
                padding: '1rem',
                marginBottom: '1.5rem',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTrans