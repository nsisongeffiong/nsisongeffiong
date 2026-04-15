## Documentation Gaps

None worth flagging.

There are no public classes, and the exported route handlers/components are either trivial or already self-explanatory in context. Internal helpers like `verifyTurnstile` are not public API.

---

## Code Quality Issues

- **[app/api/posts/route.ts:53] “Admin only” is not actually enforced.** Any authenticated Supabase user can create posts because the handler checks only `getUser()`, not an admin role/claim/allowlist.  
  **Suggested fix:** enforce server-side admin authorization before insert.

- **[components/shared/CommentForm.tsx:47] Comment submissions will always fail until Turnstile is integrated.** The component sends `window.turnstileToken ?? ''`, but nothing in the codebase sets that value. Since the API requires a token, real users cannot submit comments successfully.  
  **Suggested fix:** either integrate Turnstile properly in the form or block/hide submission until it is available.

- **[components/shared/CommentForm.tsx:195] Hardcoded hex color violates project styling rules.** Error text falls back to `#E24B4A`, but the project explicitly forbids hardcoded hex values in component styles.  
  **Suggested fix:** add a CSS variable for error text and use that instead.

- **[src/generated.py:1] Generated artifact contains invalid source code and stale implementations.** This file embeds `.tsx` source inside a Python file, includes broken imports/tokens, and is not part of the actual app structure. Keeping it in the repo invites confusion and accidental copy/paste regressions.  
  **Suggested fix:** delete `src/generated.py` from the repository.

- **[src/index.js:1] Unused non-Next entrypoint adds noise.** This file does not participate in the Next.js app and appears to be a leftover pipeline artifact.  
  **Suggested fix:** remove it unless an external tool explicitly depends on it.

- **[package.json:7] `next lint` is not a valid long-term lint entry for this setup.** With Next 15 and ESLint 9, relying on `next lint` is brittle; there is also no explicit ESLint config shown.  
  **Suggested fix:** switch to `eslint .` and add a real ESLint config.

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
  - honeypot fake-success path
  - missing Turnstile token
  - failed Turnstile verification
  - invalid email
  - too-short body
  - unpublished/nonexistent post
  - invalid `parentId`
  - cross-post parent rejection
  - reply-to-reply rejection
  - successful insert as `pending`

- **`app/api/posts/route.ts`**
  - invalid `type` query
  - `limit` coercion for NaN, negative, and oversized values
  - unauthenticated POST
  - authenticated but non-admin POST rejection once authz is added
  - invalid `type` on POST
  - duplicate slug conflict
  - `publishedAt` set only when `published === true`

- **`components/shared/CommentForm.tsx`**
  - API error rendering
  - network error rendering
  - success reset behavior
  - disabled submit state
  - `onSuccess` callback
  - `onCancel` callback
  - failure behavior when Turnstile token is absent

- **`lib/utils/index.ts`**
  - `generateSlug`
  - `formatDate`, `formatDateShort`, `formatDateRelative`
  - `estimateReadTime`
  - `truncate`
  - `absoluteUrl`

### Suggested test cases

1. **Comments API honeypot**
   - POST with `website` filled.
   - Expect `200` success with `{ pending: true }` and no DB insert.

2. **Comments API missing Turnstile**
   - POST valid fields but no `turnstileToken`.
   - Expect `400`.

3. **Comments API nested reply rejection**
   - Seed top-level comment and reply.
   - POST a reply to that reply.
   - Expect `400` with one-level-depth error.

4. **Posts API invalid type**
   - GET `/api/posts?type=bad`.
   - Expect `400`.

5. **Posts API duplicate slug**
   - POST two published posts with same title.
   - Expect second request to return `409`.

6. **CommentForm failure without token**
   - Render form, submit valid inputs without a Turnstile token.
   - Assert error state is shown.

7. **Utility tests**
   - Empty string read time returns `0`
   - `truncate` appends ellipsis only when needed
   - `absoluteUrl('/tech/post')` prefixes site URL correctly

---

## Suggested Improvements

### 1) Enforce real admin authorization in post creation

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

### 2) Make Turnstile failure explicit in the form until integrated

**Before**
```ts
const turnstileToken = (window as any).turnstileToken ?? ''
```

**After**
```ts
const turnstileToken = (window as any).turnstileToken ?? ''

if (!turnstileToken) {
  setStatus('error')
  setErrorMsg('Verification is not ready yet. Please try again later.')
  return
}
```

This avoids sending guaranteed-failing requests and gives the user a real explanation.

---

### 3) Replace hardcoded error color with a token

**Before**
```tsx
color: 'var(--color-text-danger, #E24B4A)',
```

**After**
```css
:root {
  --danger: #E24B4A;
}

.dark {
  --danger: #FF7B72;
}
```

```tsx
color: 'var(--danger)',
```

If you want to stay strict with the no-hex-in-components rule, move all color values into CSS tokens.

---

### 4) Remove dead/generated artifacts

**Before**
```text
src/generated.py
src/index.js
```

**After**
```text
# delete both files if they are not used by tooling
```

This reduces confusion and prevents reviewers from chasing non-runtime code.

---

Biggest priorities: fix admin authorization, make comment submission usable by integrating or gating Turnstile, and remove generated artifact files.