## Documentation Gaps

None worth flagging.

The exported handlers/components shown here are either trivial placeholders or adequately contextualized by naming and nearby comments. Internal helpers are not public API.

---

## Code Quality Issues

- **[app/api/posts/route.ts:55] Admin-only write is not enforced.** Any authenticated Supabase user can create posts; the handler checks authentication but not authorization.  
  **Suggested fix:** enforce an admin allowlist/claim check before insert.

- **[components/shared/DisqusComments.tsx:31] Disqus embed can fail to reinitialize correctly on client-side navigation.** Cleanup deletes `window.DISQUS`, but the effect does not call `DISQUS.reset(...)` when the script is already loaded; subsequent post navigations may leave the old thread rendered.  
  **Suggested fix:** if `window.DISQUS` exists, call `window.DISQUS.reset({ reload: true, config })` instead of appending a new script.

- **[app/(public)/page.tsx:31] Uses `var(--txt-secondary)`, which is not defined in `app/globals.css`.** This falls back to invalid color values in multiple places on public pages.  
  **Suggested fix:** replace with existing tokens like `var(--txt2)` / `var(--txt3)` or add the missing semantic alias in `globals.css`.

- **[app/(public)/poetry/page.tsx:58] Uses `var(--txt-secondary)`, which is not defined in `app/globals.css`.** Text color declarations relying on it will not render as intended.  
  **Suggested fix:** use `var(--txt2)`.

- **[app/(public)/tech/page.tsx:53] Uses `var(--txt-secondary)`, which is not defined in `app/globals.css`.** Same issue across filter chips, excerpts, and metadata.  
  **Suggested fix:** use `var(--txt2)` / `var(--txt3)` consistently.

- **[app/(public)/ideas/page.tsx:84] Uses `var(--txt-secondary)`, which is not defined in `app/globals.css`.** Multiple metadata and excerpt styles depend on an undefined token.  
  **Suggested fix:** replace with `var(--txt2)`.

- **[components/shared/CommentForm.tsx:35] Comment submission is blocked unless some external script sets `window.turnstileToken`, but no such integration is present in the provided code.** In the current repo state, real users cannot successfully submit comments.  
  **Suggested fix:** render and manage Turnstile in the form/page, or hide/disable submission until integration exists.

- **[components/shared/SiteNav.tsx:24] Root path is incorrectly marked active for all routes.** `pathname.startsWith(\`\${link.href}/\`)` makes `/` match every path when `link.href === '/'` is ever added; current nav avoids it, but the active-link logic is brittle.  
  **Suggested fix:** special-case `'/'` or use exact matching for root paths.

- **[package.json:7] `next lint` is not available in newer Next.js setups and is brittle with ESLint 9.** This commonly breaks CI/tooling even when ESLint is configured correctly.  
  **Suggested fix:** switch to `eslint .`.

- **[src/generated.py:1] Repository contains a generated artifact with embedded TSX in a `.py` file.** This is not runtime code and will confuse maintenance/review.  
  **Suggested fix:** delete `src/generated.py`.

- **[src/index.js:1] Unused non-Next entrypoint adds noise.** It does not participate in the app.  
  **Suggested fix:** remove it unless external tooling depends on it.

---

## Test Coverage

### Untested code paths

- **`app/api/auth/route.ts`**
  - malformed JSON body
  - missing email/password
  - invalid credentials
  - successful sign-in
  - sign-out error path

- **`app/api/comments/route.ts`**
  - honeypot fake-success path
  - missing Turnstile token
  - failed Turnstile verification
  - invalid email
  - too-short comment
  - nonexistent/unpublished post
  - invalid `parentId`
  - parent from another post
  - reply-to-reply rejection
  - successful insert with `status: 'pending'`

- **`app/api/posts/route.ts`**
  - invalid `type` query
  - limit coercion: NaN, negative, >100
  - unauthenticated POST
  - authenticated-but-non-admin rejection once authz is added
  - invalid POST `type`
  - duplicate slug conflict
  - `publishedAt` only set when `published === true`

- **`app/api/rss/route.ts`**
  - no posts
  - posts without excerpts
  - posts without `publishedAt`
  - XML escaping behavior with special characters in title/excerpt

- **`components/shared/CommentForm.tsx`**
  - missing Turnstile token error
  - API error rendering
  - network error rendering
  - success reset behavior
  - disabled submitting state
  - `onSuccess` callback
  - `onCancel` callback

- **`components/shared/DisqusComments.tsx`**
  - initial script injection
  - cleanup on unmount
  - navigation from one Disqus-backed post to another

- **`lib/utils/index.ts`**
  - `generateSlug`
  - `formatDate`, `formatDateShort`, `formatDateRelative`
  - `estimateReadTime`
  - `truncate`
  - `absoluteUrl`

### Suggested test cases

1. **Posts API authz**
   - POST without session → expect `401`.
   - POST with authenticated non-admin user after authz fix → expect `403`.

2. **Comments API honeypot**
   - POST with `website` filled.
   - Expect success payload with `pending: true` and verify no DB insert occurred.

3. **Comments API nested reply limit**
   - Seed top-level comment and one reply.
   - POST reply to that reply.
   - Expect `400`.

4. **Comments API cross-post parent**
   - Seed two posts and a comment on post A.
   - Submit comment on post B with parent from post A.
   - Expect `400`.

5. **RSS escaping**
   - Seed a post title/excerpt containing `&`, `<`, `>`.
   - Assert generated XML remains valid.

6. **CommentForm missing token**
   - Render form, submit valid fields with no `window.turnstileToken`.
   - Assert user-facing verification error appears and no request is sent.

7. **Disqus navigation**
   - Mount component for post A, then rerender for post B.
   - Assert thread reinitializes with new identifier/url.

8. **Undefined color token regression**
   - Render public pages and assert computed styles resolve to valid colors after token fix.

---

## Suggested Improvements

### 1) Enforce real admin authorization for post creation

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

---

### 2) Stop using undefined semantic color tokens

**Before**
```tsx
color: 'var(--txt-secondary)',
```

**After**
```tsx
color: 'var(--txt2)',
```

Or define aliases once:

```css
:root {
  --txt-secondary: var(--txt2);
  --txt-tertiary: var(--txt3);
}
```

This is preferable if you want semantic naming in components without breaking existing styles.

---

### 3) Make Disqus work reliably on post-to-post navigation

**Before**
```ts
const script = document.createElement('script')
script.src = `https://${shortname}.disqus.com/embed.js`
script.async = true
document.body.appendChild(script)
```

**After**
```ts
useEffect(() => {
  const win = window as any

  const config = function (this: any) {
    this.page.url = `${siteUrl}${path}`
    this.page.identifier = slug
    this.page.title = title
  }

  win.disqus_config = config

  if (win.DISQUS) {
    win.DISQUS.reset({
      reload: true,
      config,
    })
    return
  }

  const script = document.createElement('script')
  script.src = `https://${shortname}.disqus.com/embed.js`
  script.async = true
  script.setAttribute('data-timestamp', String(Date.now()))
  document.body.appendChild(script)

  return () => {
    const thread = document.getElementById('disqus_thread')
    if (thread) thread.innerHTML = ''
  }
}, [slug, title, path, siteUrl, shortname])
```

---

### 4) Replace brittle lint script

**Before**
```json
"lint": "next lint"
```

**After**
```json
"lint": "eslint ."
```

If needed, add an explicit ESLint config file so CI behavior is stable.

---

### 5) Remove generated artifacts from the app repo

**Before**
```text
src/generated.py
src/index.js
```

**After**
```text
# delete both files if no external pipeline step requires them
```

This avoids reviewers and future contributors chasing code that is not part of the runtime app.