## Documentation Gaps

No genuine docstring gaps in the provided code warrant flagging.

Most exported items are Next.js route/page/layout components or small utility functions in a codebase that otherwise relies on clear naming and colocated comments. The nontrivial functions already have adequate inline comments where needed:
- API route handlers have route-level comments.
- schema metadata is documented in detail.
- migration/seed scripts include usage headers.

## Code Quality Issues

[drizzle.config.ts:9] Migration config contradicts its own comment and `.env.example`: it says migrations should use the direct connection, but `url` is set to `DATABASE_URL_POOLED`. Pooled Supabase connections are the wrong choice for Drizzle migrations and can fail or behave unpredictably. Suggested fix: use `process.env.DATABASE_URL!`.

[app/api/posts/route.ts:33] `GET /api/posts` can return unpublished drafts to any caller when `publishedAt` is null ordering is applied only after filtering by `published`, which is correct; no issue there. The real correctness issue is elsewhere: this route returns full post records including raw `content` and `metadata` for listing requests. That is likely excessive for a public listing endpoint and tightly couples clients to internal schema. Suggested fix: select only listing fields (`id`, `title`, `slug`, `excerpt`, `type`, `publishedAt`, `tags`).

[app/api/posts/route.ts:52] Public `POST /api/posts` is effectively open to any authenticated Supabase user. The code comment acknowledges this, but it remains a real authorization flaw. Suggested fix: enforce admin authorization before insert via allowlist/custom claims/RLS-backed server verification.

[app/api/comments/route.ts:75] Turnstile verification runs before basic payload validation. This wastes external verification calls on obviously invalid submissions and increases latency/cost for malformed requests. Suggested fix: validate required fields and body length before calling `verifyTurnstile`, while still keeping the honeypot first.

[app/api/comments/route.ts:125] Parent comment lookup does not restrict parent status. A reply can be attached to a rejected or pending parent comment, creating inconsistent moderation state and orphaned public threads. Suggested fix: require parent comment to belong to the same post and have an allowed status, typically `approved` for public replies.

[components/shared/CommentForm.tsx:29] The form depends on `window.turnstileToken`, but no component in the provided code renders or refreshes a Turnstile widget. In the current state, all submissions will fail with “Verification is not ready yet.” Suggested fix: integrate the Turnstile widget explicitly and reset token state after submit.

[components/shared/CommentForm.tsx:57] Successful submission does not clear or rotate the Turnstile token. Most Turnstile tokens are single-use or short-lived; subsequent submissions in the same session may fail unexpectedly. Suggested fix: reset the widget/token after each submit attempt.

[app/(public)/ideas/[slug]/page.tsx:136] `dangerouslySetInnerHTML` is used with raw HTML content. It is only safe here because the data is hardcoded, but this component shape encourages unsafe reuse once content becomes database-backed. Suggested fix: sanitize stored HTML server-side before rendering, or render structured rich text instead of raw HTML.

[app/(public)/ideas/page.tsx:122] Slugs are generated inline from titles in multiple places using ad hoc regex logic. This duplicates slug rules and can drift from `generateSlug`, producing broken links if the canonical slug generation changes. Suggested fix: use a shared slug helper everywhere or store slugs in data instead of deriving them in JSX.

[app/(public)/poetry/page.tsx:222] Poetry links use `.replace(/ /g, '-')`, unlike tech/ideas pages which strip punctuation. Titles containing punctuation or repeated whitespace will produce inconsistent or invalid routes. Suggested fix: use the shared `generateSlug` helper.

[app/(public)/tech/page.tsx:151] Tech links use `.replace(/ /g, '-')`, which leaves punctuation intact. For example, apostrophes or punctuation in titles would not match canonical slugs from `generateSlug`. Suggested fix: use the shared slug helper.

[app/admin/login/page.tsx:21] The client always calls `res.json()` without checking `res.ok` or content type. Non-JSON error responses will throw and get reported as invalid credentials, masking real server issues. Suggested fix: branch on `res.ok` and handle parse failures separately.

[components/admin/AdminNav.tsx:17] Sign-out ignores response status and always redirects. If sign-out fails, the UI will navigate away while leaving the session intact. Suggested fix: check `res.ok` and surface an error or retry before redirecting.

[package.json:6] `next lint` is no longer the recommended interface in Next 15 and may not behave as expected with ESLint 9 flat config setups. Suggested fix: switch to `eslint .` or an explicit lint command aligned with the installed ESLint setup.

[package.json:18] `next` is pinned to `15.0.0`, and the lockfile marks it as vulnerable. This is a genuine security issue. Suggested fix: upgrade to a patched Next.js release.

[.gitignore:29] `src/` is ignored entirely, but `src/generated.py` and `src/index.js` are also individually listed above. The blanket ignore can hide accidental source files and makes repository state harder to reason about. Suggested fix: remove duplicate entries and ignore only the generated artifacts you actually intend to exclude.

## Test Coverage

No tests are provided. The highest-value missing coverage is around API correctness and auth.

### Untested code paths

#### `app/api/auth/route.ts`
- Missing email/password returns 400
- Supabase auth failure returns 401
- Unexpected exception returns 500
- DELETE sign-out failure path

Suggested tests:
- `POST` with `{}` → 400 and error message
- `POST` with valid shape + mocked Supabase error → 401
- `POST` with mocked thrown exception → 500
- `DELETE` with mocked `signOut` success/failure

#### `app/api/comments/route.ts`
- GET missing `postId`
- GET returns only approved comments for the requested post
- Honeypot success path
- Missing Turnstile token
- Turnstile invalid
- Missing required fields
- Invalid email
- Too-short body
- Post not found/unpublished
- Invalid parent comment
- Parent from different post
- Parent that is itself a reply
- Insert success path
- DB failure path

Suggested tests:
- `GET /api/comments` without query → 400
- `GET /api/comments?postId=x` with mixed-status comments → only approved returned, ascending by date
- `POST` with non-empty `website` → 200 success without DB insert
- `POST` with no `turnstileToken` → 400
- `POST` with invalid token → 400
- `POST` with valid token but missing `authorEmail` → 400
- `POST` with invalid parent ID → 400
- `POST` with parent from another post → 400
- `POST` replying to a reply → 400
- `POST` valid top-level comment → 201 and pending response
- `POST` valid reply to approved top-level comment → 201

#### `app/api/posts/route.ts`
- Invalid `type` query
- `limit` clamping behavior
- Unauthenticated POST
- Invalid payload POST
- Invalid type POST
- Duplicate slug conflict handling
- Authenticated non-admin user currently allowed — should be captured as a failing security regression test once fixed

Suggested tests:
- `GET /api/posts?type=bad` → 400
- `GET /api/posts?limit=-1` clamps to 1
- `GET /api/posts?limit=999` clamps to 100
- `POST` without user → 401
- `POST` missing `title`/`type`/`content` → 400
- `POST` duplicate title causing unique violation → 409
- Future test after auth fix: authenticated non-admin → 403

#### `app/api/rss/route.ts`
- CDATA escaping for titles/excerpts containing `]]>`
- Fallback `publishedAt` behavior
- Empty excerpt omission
- Error path on DB failure

Suggested tests:
- Feed item with title/excerpt containing `]]>` produces valid escaped CDATA
- Null excerpt does not render `<description>`
- Null `publishedAt` uses build date
- DB throw returns JSON 500

#### `lib/utils/index.ts`
Suggested unit tests:
- `generateSlug` handles punctuation, extra spaces, casing
- `estimateReadTime('') === 0`
- `estimateReadTime` rounds and floors at 1 for non-empty content
- `truncate` preserves short strings and appends ellipsis correctly
- `absoluteUrl('/x')` respects env override

#### `components/shared/CommentForm.tsx`
Suggested component tests:
- Shows verification error when no Turnstile token
- Sends normalized payload on success
- Clears fields on successful submit
- Displays server-provided error
- Displays network error on fetch failure
- Calls `onSuccess` after successful submission
- Renders section-specific copy/styling branches for `poetry`, `tech`, `ideas`

## Suggested Improvements

### 1) Fix migration database URL

**Before**
```ts
dbCredentials: {
  // Use direct connection (not pooled) for migrations
  url: process.env.DATABASE_URL_POOLED!,
},
```

**After**
```ts
dbCredentials: {
  // Use direct connection (not pooled) for migrations
  url: process.env.DATABASE_URL!,
},
```

---

### 2) Validate comment payload before Turnstile verification

This reduces unnecessary external calls and makes failures faster.

**Before**
```ts
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
```

**After**
```ts
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
```

---

### 3) Enforce parent comment status when creating replies

**Before**
```ts
const [parent] = await db
  .select({
    id:       comments.id,
    postId:   comments.postId,
    parentId: comments.parentId,
  })
```

**After**
```ts
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
```

---

### 4) Centralize slug generation in UI routes

There are several inline slug builders with inconsistent behavior.

**Before**
```tsx
href={`/poetry/${poem.title.toLowerCase().replace(/ /g, '-')}`}
```

**After**
```tsx
import { generateSlug } from '@/lib/utils'

href={`/poetry/${generateSlug(poem.title)}`}
```

Apply the same refactor in:
- `app/(public)/poetry/page.tsx`
- `app/(public)/tech/page.tsx`
- `app/(public)/ideas/page.tsx`
- `app/(public)/tech/[slug]/page.tsx` if reused elsewhere

Better yet, store `slug` directly in the data objects.

**After with explicit data**
```ts
const poems = [
  {
    title: 'Cartography of Silence',
    slug: 'cartography-of-silence',
    // ...
  },
]
```

```tsx
href={`/poetry/${poem.slug}`}
```

---

### 5) Narrow the public posts API response

Listing endpoints should not return full content blobs unless needed.

**Before**
```ts
const result = await db
  .select()
  .from(posts)
  .where(and(...conditions))
  .orderBy(desc(posts.publishedAt))
  .limit(limit)
```

**After**
```ts
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
```

---

### 6) Harden admin sign-out flow

**Before**
```ts
const handleSignOut = async () => {
  await fetch('/api/auth', { method: 'DELETE' });
  router.push('/admin/login');
};
```

**After**
```ts
const handleSignOut = async () => {
  const res = await fetch('/api/auth', { method: 'DELETE' });

  if (!res.ok) {
    // surface an error toast/message in real UI
    return;
  }

  router.push('/admin/login');
};
```

---

### 7) Improve login error handling

**Before**
```ts
const res = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

const data = await res.json()

if (data.success === true) {
  router.push('/admin/dashboard')
} else {
  setError(data.error || 'Invalid credentials')
}
```

**After**
```ts
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
```

---

### 8) Add real admin authorization to post creation

A minimal server-side allowlist is better than none.

**Before**
```ts
if (!user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorised' },
    { status: 401 }
  )
}

// TODO: Add admin authorization check here before production.
```

**After**
```ts
if (!user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorised' },
    { status: 401 }
  )
}

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
```

This should still be complemented with DB-side protections, but it closes the immediate hole.

---

### 9) Remove dead/duplicate ignore rules

**Before**
```gitignore
# Pipeline artifacts
src/generated.py
src/index.js
reviews/

# Pipeline artifacts
src/
reviews/
CONTEXT.md
prompts/
```

**After**
```gitignore
# Pipeline artifacts
src/generated.py
src/index.js
reviews/
CONTEXT.md
prompts/
```

If `src/` is truly meant to be entirely generated and never committed, keep only `src/` and remove the file-specific entries. Right now it is redundant and confusing.