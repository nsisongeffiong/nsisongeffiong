## Documentation Gaps

None worth flagging.

The exported functions/classes in the provided code are either:
- trivial route/page placeholders, or
- sufficiently self-explanatory for this codebase, with nearby comments where needed.

## Code Quality Issues

- **[app/api/posts/route.ts:55] Admin-only post creation is not enforced.** The handler allows any authenticated Supabase user to create and publish posts, which contradicts the stated admin-only requirement.  
  **Suggested fix:** enforce authorization beyond authentication, e.g. admin email allowlist or Supabase custom claim check before insert.

- **[components/shared/CommentForm.tsx:35] Comment submission cannot succeed unless some external code sets `window.turnstileToken`, but no Turnstile integration is present in the provided app.** In the current repo state, all legitimate comment submissions will fail client-side.  
  **Suggested fix:** explicitly render/manage the Turnstile widget and read its token in the form, or disable/hide comment submission until integration exists.

- **[app/api/rss/route.ts:24] RSS item titles are inserted into CDATA without escaping the `]]>` terminator.** A post title or excerpt containing `]]>` would produce invalid XML. This is rare but a genuine correctness issue for feed generation.  
  **Suggested fix:** sanitize CDATA content before interpolation, e.g. replace `]]>` with `]]]]><![CDATA[>`.

- **[app/api/comments/route.ts:7] `verifyTurnstile` sends JSON to Cloudflare’s siteverify endpoint.** Cloudflare documents this endpoint as `application/x-www-form-urlencoded`; JSON may work inconsistently or fail depending on upstream behavior.  
  **Suggested fix:** send a `URLSearchParams` body with form encoding.

- **[scripts/migrate-ghost.ts:63] Migration failures are swallowed and the script still exits successfully.** Non-duplicate insert errors are logged, but the process always exits `0`, making automation/reporting incorrect.  
  **Suggested fix:** track failures and exit non-zero if any record failed unexpectedly.

## Test Coverage

### Untested code paths

- **`app/api/auth/route.ts`**
  - malformed JSON request body
  - missing email/password
  - invalid credentials
  - successful sign-in
  - sign-out failure path

- **`app/api/comments/route.ts`**
  - honeypot fake-success path
  - missing Turnstile token
  - Turnstile verification failure
  - invalid email format
  - too-short comment
  - unpublished/nonexistent post
  - invalid `parentId`
  - `parentId` from another post
  - reply-to-reply rejection
  - successful pending insert

- **`app/api/posts/route.ts`**
  - invalid query `type`
  - limit coercion for NaN, negative, >100
  - unauthenticated POST
  - unauthorized authenticated POST once admin auth is added
  - invalid `type` in body
  - duplicate slug conflict
  - `publishedAt` behavior when `published` is false vs true

- **`app/api/rss/route.ts`**
  - empty feed
  - post without excerpt
  - post without `publishedAt`
  - title/excerpt containing XML edge cases like `&`, `<`, and `]]>`

- **`components/shared/CommentForm.tsx`**
  - missing Turnstile token branch
  - API error rendering
  - network error rendering
  - success reset
  - submit button disabled state
  - `onSuccess` callback
  - `onCancel` callback

- **`lib/utils/index.ts`**
  - `generateSlug`
  - `formatDate`, `formatDateShort`, `formatDateRelative`
  - `estimateReadTime`
  - `truncate`
  - `absoluteUrl`

- **`scripts/migrate-ghost.ts`**
  - missing export file
  - skipping drafts
  - duplicate slug handling
  - non-duplicate DB failure causing non-zero exit

### Suggested test cases

1. **Posts API authorization**
   - POST without session → expect `401`
   - POST with authenticated non-admin user → expect `403` after authz fix

2. **Comments API honeypot**
   - POST with `website` filled
   - expect `{ success: true, data: { pending: true } }`
   - verify no DB insert occurred

3. **Comments API nesting rule**
   - seed top-level comment and a reply
   - attempt reply to the reply
   - expect `400`

4. **Comments API cross-post parent**
   - seed comment on post A
   - submit reply on post B using parent from A
   - expect `400`

5. **RSS CDATA safety**
   - seed a post title/excerpt containing `]]>`
   - assert generated feed remains valid XML

6. **CommentForm missing token**
   - submit valid fields without Turnstile token
   - assert verification error is shown and no fetch occurs

7. **Turnstile verification request format**
   - mock `fetch` in `verifyTurnstile`
   - assert request uses form-encoded body

8. **Ghost migration exit status**
   - mock one duplicate and one hard DB failure
   - assert script exits non-zero when a real failure occurs

## Suggested Improvements

### 1) Enforce admin authorization in `POST /api/posts`

**Before**
```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorised' },
    { status: 401 }
  )
}
```

**After**
```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

if (!user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorised' },
    { status: 401 }
  )
}

if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
  return NextResponse.json(
    { success: false, error: 'Forbidden' },
    { status: 403 }
  )
}
```

### 2) Use the documented Turnstile request format

**Before**
```ts
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
```

**After**
```ts
const body = new URLSearchParams({
  secret: process.env.TURNSTILE_SECRET_KEY ?? '',
  response: token,
})

const res = await fetch(
  'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  }
)
```

### 3) Make RSS CDATA safe

**Before**
```ts
<title><![CDATA[${post.title}]]></title>
${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ''}
```

**After**
```ts
function toCdataSafe(value: string): string {
  return value.replaceAll(']]>', ']]]]><![CDATA[>')
}
```

```ts
<title><![CDATA[${toCdataSafe(post.title)}]]></title>
${post.excerpt ? `<description><![CDATA[${toCdataSafe(post.excerpt)}]]></description>` : ''}
```

### 4) Fail the Ghost migration script when real inserts fail

**Before**
```ts
let migrated = 0
let skipped  = 0
```

```ts
} catch (error: any) {
  if (error?.code === '23505') {
    console.log(`  ↷ Already exists: "${ghost.title}" — skipping`)
    skipped++
  } else {
    console.error(`  ✗ Failed: "${ghost.title}"`, error.message)
  }
}
```

```ts
console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`)
process.exit(0)
```

**After**
```ts
let migrated = 0
let skipped = 0
let failed = 0
```

```ts
} catch (error: any) {
  if (error?.code === '23505') {
    console.log(`  ↷ Already exists: "${ghost.title}" — skipping`)
    skipped++
  } else {
    console.error(`  ✗ Failed: "${ghost.title}"`, error.message)
    failed++
  }
}
```

```ts
console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
```

### 5) Encapsulate Turnstile access instead of reading a global directly

**Before**
```ts
const turnstileToken = (window as any).turnstileToken ?? ''
```

**After**
```ts
declare global {
  interface Window {
    turnstileToken?: string
  }
}

const turnstileToken = window.turnstileToken ?? ''
```

This does not solve the missing integration by itself, but it removes the untyped global access and makes the dependency explicit.