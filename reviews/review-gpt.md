## Documentation Gaps

None worth flagging.

The public exports shown are Next.js page/route entrypoints or small utilities/components with either obvious intent or adequate inline documentation where behavior is non-obvious (`app/api/comments/route.ts`, `lib/db/schema.ts`, `scripts/migrate-ghost.ts`).

---

## Code Quality Issues

- **[app/api/posts/route.ts:40] Admin-only post creation is not enforced.** Any authenticated Supabase user can create posts, which violates the project’s admin-only requirement.  
  **Suggested fix:** add a real authorization check after authentication (email allowlist, custom claim, or DB/RLS-backed admin role).

- **[components/shared/CommentForm.tsx:33] Legitimate comment submission cannot succeed with the provided code because the form depends on `window.turnstileToken`, but no Turnstile widget or token-population code is rendered anywhere in the app.** All real submissions will hit the client-side “Verification is not ready yet” path.  
  **Suggested fix:** render Turnstile in the form (or parent), capture the token in component state, and submit that explicitly.

- **[app/admin/login/page.tsx:113] Error text uses `var(--danger)`, which is defined correctly, but the catch block collapses all failures into "Invalid credentials".** This hides server/network failures and makes debugging harder.  
  **Suggested fix:** distinguish transport errors from auth failures, e.g. show a generic network/server message in the `catch` branch.

- **[app/(public)/tech/page.tsx:74] Hardcoded color `#9FE1CB` is used directly multiple times.** This violates the project rule against hardcoded hex values in component styles.  
  **Suggested fix:** add/use an appropriate semantic token for text rendered on `var(--teal-hero)` backgrounds.

- **[app/(public)/tech/[slug]/page.tsx:127] Hardcoded color `#E1F5EE` is used directly.** This bypasses the token system.  
  **Suggested fix:** replace with an existing token such as `var(--teal-pale)` or a dedicated semantic token.

- **[app/(public)/tech/[slug]/page.tsx:212] Hardcoded color `#9FE1CB` is used directly in code blocks.** This bypasses the token system.  
  **Suggested fix:** use a semantic token for code text on teal backgrounds.

- **[app/globals.css:80] `.tiptap pre` uses hardcoded `#9FE1CB`.** Same token-system violation.  
  **Suggested fix:** move this to a semantic CSS variable used consistently across tech/code surfaces.

- **[app/(public)/ideas/[slug]/page.tsx:131] `dangerouslySetInnerHTML` renders HTML from content without any sanitization boundary in this file.** If this placeholder becomes DB-backed content without server-side sanitization, it creates an XSS risk.  
  **Suggested fix:** sanitize stored/rendered HTML before passing it to `dangerouslySetInnerHTML`, or restrict content to trusted editor output with sanitization on save.

- **[app/(public)/poetry/[slug]/page.tsx:291] Displayed `post.commentCount` can drift from the rendered `comments` array.** The page shows a hardcoded count (`3`) while only two top-level comments plus one reply are present.  
  **Suggested fix:** derive the displayed count from the rendered comment data, as done in the ideas page.

- **[package.json:8] `next lint` is not a safe default for a Next 15 + ESLint 9 setup.** This commonly breaks automation/tooling.  
  **Suggested fix:** switch to plain ESLint, e.g. `"lint": "eslint ."` with project config.

- **[package.json / package-lock.json] Project is pinned to `next@15.0.0`, which is flagged in the lockfile as vulnerable.**  
  **Suggested fix:** upgrade to a patched Next 15 release.

---

## Test Coverage

### Untested code paths

- **`app/api/auth/route.ts`**
  - malformed JSON body
  - missing email/password
  - invalid credentials
  - successful login
  - sign-out failure path

- **`app/api/comments/route.ts`**
  - honeypot fake-success branch
  - missing Turnstile token
  - Turnstile verification failure
  - invalid email
  - too-short body
  - nonexistent/unpublished post
  - invalid `parentId`
  - `parentId` from another post
  - reply-to-reply rejection
  - successful insert with `pending` status

- **`app/api/posts/route.ts`**
  - invalid `type` query param
  - limit clamping (`NaN`, negative, >100)
  - unauthenticated POST
  - authenticated non-admin POST once authz is added
  - invalid body `type`
  - duplicate slug conflict
  - `published`/`publishedAt` interaction

- **`app/api/rss/route.ts`**
  - empty feed
  - post without excerpt
  - post without `publishedAt`
  - title/excerpt containing `]]>` or XML-sensitive content

- **`components/shared/CommentForm.tsx`**
  - missing token error path
  - API error rendering
  - network error rendering
  - success reset behavior
  - `onSuccess` callback
  - `onCancel` callback
  - disabled state during submit

- **`lib/utils/index.ts`**
  - `generateSlug`
  - date formatters
  - `estimateReadTime`
  - `truncate`
  - `absoluteUrl`

- **`components/shared/DisqusComments.tsx`**
  - initial script injection
  - `DISQUS.reset` path on client navigation
  - cleanup behavior on unmount

### Suggested test cases

1. **Comments API honeypot**
   - POST with `website` populated
   - assert `200` with `{ success: true, data: { pending: true } }`
   - assert no DB insert

2. **Comments API one-level reply rule**
   - seed top-level comment and a reply
   - attempt to reply to the reply
   - expect `400`

3. **Comments API cross-post parent validation**
   - create comment on post A
   - submit reply for post B using A’s comment ID
   - expect `400`

4. **CommentForm current failure mode**
   - render form
   - submit valid fields without Turnstile token
   - assert verification error is shown
   - assert no network request is made

5. **Posts API authorization**
   - POST without auth → `401`
   - POST with authenticated non-admin user → `403` after authz fix

6. **RSS XML safety**
   - seed a post with `title`/`excerpt` containing `]]>`
   - assert generated feed remains valid XML

7. **Poetry comment count correctness**
   - render poetry single page
   - assert displayed response count matches rendered comments + replies

8. **Disqus client navigation**
   - mount `DisqusComments` with one slug, then rerender with another
   - assert `DISQUS.reset` is called instead of injecting duplicate scripts

---

## Suggested Improvements

### 1) Enforce real admin authorization in `POST /api/posts`

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

### 2) Replace implicit global Turnstile dependency with explicit component state

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

Render a real widget:
```tsx
<TurnstileWidget onVerify={setTurnstileToken} />
```

This removes hidden coupling and makes the form testable.

---

### 3) Use a semantic token for tech-on-hero text instead of hardcoded hex

**Before**
```tsx
color: '#9FE1CB',
```

**After**
```css
:root {
  --teal-on-hero: #9FE1CB;
}

.dark {
  --teal-on-hero: #9FE1CB;
}
```

```tsx
color: 'var(--teal-on-hero)',
```

This keeps the intended fixed contrast while still respecting the token rule.

---

### 4) Derive poetry comment count from rendered data

**Before**
```tsx
<span>
  {post.commentCount} responses
</span>
```

**After**
```tsx
const commentCount = comments.reduce(
  (acc, comment) => acc + 1 + comment.replies.length,
  0
)
```

```tsx
<span>
  {commentCount} responses
</span>
```

This prevents stale UI when placeholder data changes.

---

### 5) De-duplicate slug generation

`app/(public)/tech/[slug]/page.tsx` defines a local `slugify` even though `lib/utils` already exports `generateSlug`.

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

This avoids divergent slug behavior between UI and API code.

---

### 6) Improve admin login error handling

**Before**
```ts
} catch {
  setError('Invalid credentials')
}
```

**After**
```ts
} catch {
  setError('Unable to reach the server. Please try again.')
}
```

This preserves the intentional credential message for 401 responses while not mislabeling network failures as auth failures.