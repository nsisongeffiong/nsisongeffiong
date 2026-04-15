## Documentation Gaps

None worth flagging.

The exported APIs and components shown are either:
- conventional Next.js page/route exports,
- small internal utilities with clear names, or
- already documented where non-obvious behavior exists (`app/api/comments/route.ts`, `lib/db/schema.ts`, `scripts/migrate-ghost.ts`).

## Code Quality Issues

- **[app/api/posts/route.ts:40] Admin-only post creation is not enforced.** Any authenticated Supabase user can create posts, which contradicts the project’s admin-only requirement.  
  **Suggested fix:** add an authorization check after authentication, e.g. email allowlist, custom claim, or DB/RLS-backed admin role.

- **[components/shared/CommentForm.tsx:33] Legitimate comment submission cannot succeed in the current codebase because the form depends on `window.turnstileToken`, but no Turnstile widget/integration is rendered anywhere in the provided app.** Every real submission will hit the client-side “Verification is not ready yet” branch.  
  **Suggested fix:** render and manage a Turnstile widget in the form or a parent component, and store its token in component state instead of relying on an implicit global.

- **[app/(public)/tech/[slug]/page.tsx:127] Hardcoded hex color violates the project token rule.** `color: '#E1F5EE'` bypasses the required CSS variable system.  
  **Suggested fix:** replace with an existing token such as `var(--teal-light)` or add a semantic token if a distinct shade is required.

- **[app/(public)/tech/[slug]/page.tsx:212] Hardcoded hex color violates the project token rule.** `color: '#9FE1CB'` is used directly in the code block.  
  **Suggested fix:** use `var(--teal-light)`.

- **[app/globals.css:80] Hardcoded hex color violates the project token rule.** `.tiptap pre` uses `color: #9FE1CB` directly.  
  **Suggested fix:** use `var(--teal-light)`.

- **[app/admin/login/page.tsx:126] Uses undefined CSS variable `var(--color-text-danger)`.** This will render no intended danger color unless defined elsewhere. The project defines `--danger`, not `--color-text-danger`.  
  **Suggested fix:** replace with `var(--danger)`.

- **[types/index.ts:35] Navigation includes `/about`, but no `/about` route is present in the provided app.** This creates a dead navigation link.  
  **Suggested fix:** either implement `/about` or remove the nav item until the route exists.

- **[package.json:8] `next lint` is no longer the correct lint entrypoint for Next 15 / ESLint 9 setups.** This commonly breaks CI/tooling in current Next 15 projects.  
  **Suggested fix:** switch to plain ESLint, e.g. `"lint": "eslint ."` with an appropriate config.

- **[package.json:14, package-lock.json] Project is pinned to `next@15.0.0`, which is flagged in the lockfile as having a security vulnerability.**  
  **Suggested fix:** upgrade to a patched Next 15 release.

## Test Coverage

### Untested code paths

- **`app/api/auth/route.ts`**
  - malformed JSON body
  - missing credentials
  - invalid credentials
  - successful login
  - sign-out failure

- **`app/api/comments/route.ts`**
  - honeypot fake-success path
  - missing Turnstile token
  - Turnstile verification failure
  - invalid email
  - short comment body
  - nonexistent/unpublished post
  - invalid `parentId`
  - `parentId` from a different post
  - reply-to-reply rejection
  - successful insert with `pending` status

- **`app/api/posts/route.ts`**
  - invalid query `type`
  - limit clamping: NaN, negative, >100
  - unauthenticated POST
  - non-admin authenticated POST once authz is added
  - invalid body `type`
  - duplicate slug conflict
  - published vs unpublished `publishedAt` behavior

- **`app/api/rss/route.ts`**
  - empty feed
  - post without excerpt
  - post without `publishedAt`
  - XML edge cases in title/excerpt, especially `]]>`

- **`components/shared/CommentForm.tsx`**
  - missing token error path
  - API error rendering
  - network error rendering
  - successful reset
  - `onSuccess` callback
  - `onCancel` callback
  - disabled submit state during submission

- **`lib/utils/index.ts`**
  - `generateSlug`
  - `formatDate`, `formatDateShort`, `formatDateRelative`
  - `estimateReadTime`
  - `truncate`
  - `absoluteUrl`

- **`scripts/migrate-ghost.ts`**
  - missing export file
  - draft skipping
  - duplicate post skip
  - hard DB failure increments `failed`
  - non-zero exit on failure

### Suggested test cases

1. **Comments API honeypot**
   - POST with `website` populated
   - assert `200` success with `{ pending: true }`
   - assert no DB insert occurred

2. **Comments API one-level reply rule**
   - seed top-level comment and reply
   - attempt reply to that reply
   - expect `400`

3. **Comments API cross-post parent validation**
   - create comment on post A
   - submit reply for post B using A’s comment ID
   - expect `400`

4. **CommentForm current integration failure**
   - render form
   - submit valid fields without Turnstile token
   - assert verification error is shown
   - assert no network request is made

5. **Posts API authorization**
   - POST without auth → `401`
   - POST with authenticated non-admin user → `403` after authz fix

6. **RSS XML safety**
   - seed a published post with title/excerpt containing `]]>`
   - assert feed remains valid XML

7. **Admin login error styling**
   - render login page with an error state
   - assert computed style uses the expected danger token after fix

8. **Navigation integrity**
   - render `SiteNav`
   - assert every nav href resolves to an implemented route, or snapshot the intended set and fail on dead links like `/about`

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
const { data: { user } } = await supabase.auth.getUser()

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

And render a real widget:
```tsx
<TurnstileWidget onVerify={setTurnstileToken} />
```

This removes hidden coupling and makes the form testable.

### 3) Fix undefined admin login error token

**Before**
```tsx
color: 'var(--color-text-danger)',
```

**After**
```tsx
color: 'var(--danger)',
```

### 4) Remove hardcoded tech colors

**Before**
```tsx
color: '#E1F5EE',
```

```tsx
color: '#9FE1CB',
```

**After**
```tsx
color: 'var(--teal-pale)',
```

```tsx
color: 'var(--teal-light)',
```

Or, if `var(--teal-pale)` is semantically wrong for text in that spot, add a named semantic token and use that consistently.

### 5) De-duplicate local slug generation

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

This avoids divergent slug behavior across pages and APIs.

### 6) Remove or defer dead nav links

**Before**
```ts
export const NAV_LINKS: NavLink[] = [
  { label: 'Poetry', href: '/poetry' },
  { label: 'Tech',   href: '/tech'   },
  { label: 'Ideas',  href: '/ideas'  },
  { label: 'About',  href: '/about'  },
]
```

**After**
```ts
export const NAV_LINKS: NavLink[] = [
  { label: 'Poetry', href: '/poetry' },
  { label: 'Tech',   href: '/tech'   },
  { label: 'Ideas',  href: '/ideas'  },
]
```

Or add the missing `/about` route if it is intended.