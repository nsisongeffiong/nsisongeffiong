## Documentation Gaps

None worth flagging.

The exported surfaces shown are mostly Next.js route/page entrypoints or small UI helpers, and the non-obvious behavior already has inline documentation where it matters (`app/api/comments/route.ts`, `lib/db/schema.ts`, `scripts/migrate-ghost.ts`).

---

## Code Quality Issues

- **[app/api/posts/route.ts:41] Admin-only post creation is not enforced.** The route only checks for an authenticated Supabase user, but project rules require admin-only access. Any signed-in user can create posts.  
  **Suggested fix:** add a real authorization layer after authentication (email allowlist, custom claim, or RLS-backed role check).

- **[components/shared/CommentForm.tsx:37] Real comment submission cannot succeed with the code shown because the form requires `window.turnstileToken`, but no widget/token population path is present anywhere in the provided app.** This forces all legitimate submissions into the client-side error path.  
  **Suggested fix:** render Turnstile in the form (or pass a token in via props/state) and submit the captured token explicitly.

- **[app/(public)/tech/[slug]/page.tsx:146] Hardcoded hex color `#E1F5EE` bypasses the token system.** This violates the project rule against hardcoded hex values in component styles.  
  **Suggested fix:** replace with `var(--teal-pale)` or another semantic token.

- **[app/(public)/tech/[slug]/page.tsx:247] Hardcoded hex color `#9FE1CB` is used in code blocks.** Same token-system violation.  
  **Suggested fix:** replace with `var(--teal-light)` or a dedicated semantic token.

- **[app/globals.css:81] `.tiptap pre` uses hardcoded `#9FE1CB`.** Same token-system violation.  
  **Suggested fix:** use `var(--teal-light)` or a dedicated semantic token shared across tech/code surfaces.

- **[app/(public)/poetry/[slug]/page.tsx:58] `post.commentCount` is duplicated state and can drift from rendered comments.** The displayed count is hardcoded separately from the `comments` data.  
  **Suggested fix:** derive the count from `comments` and `replies`, as already done in the ideas page.

- **[app/(public)/tech/[slug]/page.tsx:89] Local `slugify()` duplicates shared slug logic in `lib/utils`.** This risks inconsistent anchor IDs if slug behavior changes in one place only.  
  **Suggested fix:** reuse `generateSlug` from `@/lib/utils`.

- **[package.json:8] `next lint` is not a reliable script for a Next 15 / ESLint 9 setup.** This commonly breaks CI/tooling even when ESLint itself is configured correctly.  
  **Suggested fix:** switch to `eslint .` once ESLint config is in place.

- **[package.json:12] Project is pinned to `next@15.0.0`, and the lockfile flags that version as vulnerable.**  
  **Suggested fix:** upgrade to a patched Next 15 release and rerun build/lint regression checks.

---

## Test Coverage

### Untested code paths

- **`app/api/auth/route.ts`**
  - malformed JSON body
  - missing email/password
  - invalid credentials
  - successful login
  - DELETE sign-out failure path

- **`app/api/comments/route.ts`**
  - honeypot fake-success path
  - missing Turnstile token
  - Turnstile verification failure
  - invalid email format
  - too-short body
  - nonexistent post
  - unpublished post
  - invalid `parentId`
  - `parentId` from another post
  - reply-to-reply rejection
  - successful insert with `pending` status

- **`app/api/posts/route.ts`**
  - invalid `type` query param
  - `limit` parsing/clamping (`NaN`, negative, >100)
  - unauthenticated POST
  - authenticated non-admin POST after authz fix
  - invalid POST body `type`
  - duplicate slug conflict
  - `published` → `publishedAt` behavior

- **`app/api/rss/route.ts`**
  - empty post set
  - item with no excerpt
  - item with no `publishedAt`
  - CDATA edge case with `]]>` in title/excerpt

- **`components/shared/CommentForm.tsx`**
  - missing token error path
  - API error rendering
  - network error rendering
  - success reset behavior
  - `onSuccess` callback
  - `onCancel` callback
  - disabled submit state

- **`components/shared/DisqusComments.tsx`**
  - initial script injection
  - `DISQUS.reset` path when navigating between posts
  - cleanup on unmount

- **`lib/utils/index.ts`**
  - `generateSlug`
  - date formatters
  - `estimateReadTime`
  - `truncate`
  - `absoluteUrl`

### Suggested test cases

1. **Comments API honeypot**
   - POST with `website` populated
   - assert `200` and fake success payload
   - assert no DB insert occurred

2. **Comments API one-level reply limit**
   - seed top-level comment and reply
   - attempt to reply to the reply
   - expect `400`

3. **Comments API cross-post parent validation**
   - create comment on post A
   - submit reply for post B using post A’s comment ID
   - expect `400`

4. **Comments API unpublished post rejection**
   - seed unpublished post
   - submit comment against it
   - expect `404`

5. **CommentForm current failure mode**
   - render form
   - fill valid fields with no Turnstile token present
   - assert verification error is shown
   - assert no network request is sent

6. **Posts API authorization**
   - POST without auth → `401`
   - POST with authenticated non-admin user → `403` after authz fix

7. **RSS CDATA safety**
   - seed a post containing `]]>` in title/excerpt
   - assert response is still valid XML and escaped as intended

8. **Poetry response count correctness**
   - render poetry single page
   - assert displayed count matches top-level comments + replies

9. **Disqus navigation behavior**
   - mount `DisqusComments` for one slug, rerender for another
   - assert `DISQUS.reset` is called instead of injecting another script

---

## Suggested Improvements

### 1) Enforce actual admin authorization in `POST /api/posts`

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
const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorised' },
    { status: 401 }
  )
}

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
  return NextResponse.json(
    { success: false, error: 'Forbidden' },
    { status: 403 }
  )
}
```

---

### 2) Remove the implicit global Turnstile dependency

**Before**
```tsx
const turnstileToken = window.turnstileToken ?? ''

if (!turnstileToken) {
  setStatus('error')
  setErrorMsg('Verification is not ready yet. Please try again later.')
  return
}
```

**After**
```tsx
const [turnstileToken, setTurnstileToken] = useState('')

if (!turnstileToken) {
  setStatus('error')
  setErrorMsg('Verification is required before submitting.')
  return
}
```

And render/capture the token explicitly:
```tsx
<TurnstileWidget onVerify={setTurnstileToken} />
```

This removes hidden coupling and makes the form testable.

---

### 3) Replace hardcoded tech colors with tokens

**Before**
```tsx
color: '#E1F5EE'
```

```tsx
color: '#9FE1CB'
```

**After**
```tsx
color: 'var(--teal-pale)'
```

```tsx
color: 'var(--teal-light)'
```

And in CSS:
```css
.tiptap pre {
  background: var(--teal-hero);
  color: var(--teal-light);
}
```

---

### 4) Derive poetry comment count from rendered data

**Before**
```tsx
const post = {
  // ...
  commentCount: 3,
};
```

```tsx
{post.commentCount} responses
```

**After**
```tsx
const commentCount = comments.reduce(
  (acc, comment) => acc + 1 + comment.replies.length,
  0
)
```

```tsx
{commentCount} responses
```

This prevents stale UI.

---

### 5) Reuse shared slug generation

**Before**
```ts
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

**After**
```ts
import { generateSlug } from '@/lib/utils'
```

```ts
const id = generateSlug(block.text)
```

This avoids divergence between local page behavior and API/shared utilities.