## Documentation Gaps

No genuine docstring gaps worth flagging.

Most exported items are route handlers or trivial page/layout components where the function name and colocated comments are already sufficient. Internal helpers like `verifyTurnstile` are not public API.

---

## Code Quality Issues

- **[lib/db/schema.ts:39] Schema docs are out of sync with the project rules.** The `metadata` comment documents a rejected `poemNumber` field and calls the Tech section “Technical”, which conflicts with `CONTEXT.md` and invites incorrect future usage.  
  **Suggested fix:** update the comment to reflect the actual metadata shapes (`category`, `poetNote`, `legacyDisqus` for poetry; `readTime`, `featured`, `codeLanguages`, `legacyDisqus` for tech).

- **[types/index.ts:8] `PostType` does not match the database enum.** The app type is `'poetry' | 'tech' | 'ideas'`, but `lib/db/schema.ts` defines the DB enum as `'poetry' | 'tech' | 'ideas'`? Wait—here the schema is actually correct as `tech`; the mismatch is elsewhere in comments/docs, not code. No issue here.  
  **Suggested fix:** none.

- **[app/api/posts/route.ts:14] Invalid `type` query values are silently ignored instead of rejected.** `type` is cast to `PostType | null`; if a caller passes an arbitrary string, the API returns all published posts rather than a 400. That makes client bugs harder to detect.  
  **Suggested fix:** validate `type` against the allowed literals and return `400` for invalid values.

- **[app/api/posts/route.ts:47] “admin only” is enforced only by presence of any authenticated user.** Any logged-in Supabase user can create posts. If this project truly has a single-admin backend, this is an authorization gap, not just missing polish.  
  **Suggested fix:** enforce an admin claim, allowlist, or server-side role check before insert.

- **[app/api/comments/route.ts:100] Reply depth is not constrained to one level as required by project rules.** The schema/comment system explicitly says “one level of replies only”, but the POST handler accepts a `parentId` whose parent may itself already be a reply.  
  **Suggested fix:** when `parentId` is present, fetch the parent comment and reject if `parent.parentId` is non-null.

- **[components/shared/CommentForm.tsx:29] Turnstile integration is stubbed but the form behaves like production code.** The client always sends `window.turnstileToken ?? ''`, so submissions will fail unless some external script mutates global state. That is acceptable as temporary scaffolding, but the current component gives no user-visible indication that verification is unavailable.  
  **Suggested fix:** either integrate Turnstile fully or gate submission with a clearer UI/error state until it exists.

- **[components/shared/CommentForm.tsx:194] Ideas footer text uses the wrong font family.** The Ideas section rules require Source Serif 4 for body text, but the footer note uses Cormorant because `isPoetry || isIdeas` is grouped together.  
  **Suggested fix:** split the font-family branch so Ideas uses `var(--font-source-serif), serif`.

- **[components/shared/CommentForm.tsx:57] Success-state styling for Ideas uses the wrong heading/body distinction.** Ideas success copy is rendered in Source Serif? Actually success state is correct; no issue.

- **[app/(public)/page.tsx:1] `SiteNav` is imported as a default export, but `components/shared/SiteNav.tsx` exports it as a named export.** This will fail at compile time.  
  **Suggested fix:** change to `import { SiteNav } from '@/components/shared/SiteNav'`.

- **[app/(public)/poetry/page.tsx:1] `SiteNav` is imported as a default export, but only a named export exists.** Compile-time import error.  
  **Suggested fix:** use `import { SiteNav } from '@/components/shared/SiteNav'`.

- **[app/(public)/tech/page.tsx:1] `SiteNav` is imported as a default export, but only a named export exists.** Compile-time import error.  
  **Suggested fix:** use `import { SiteNav } from '@/components/shared/SiteNav'`.

- **[app/(public)/ideas/page.tsx:1] `SiteNav` is imported as a default export, but only a named export exists.** Compile-time import error.  
  **Suggested fix:** use `import { SiteNav } from '@/components/shared/SiteNav'`.

- **[app/(public)/page.tsx:37] Uses undefined CSS variables `var(--fg)` / `var(--fg2)` throughout.** The token system defines `--txt`, `--txt2`, `--txt3`, not `--fg`. Large parts of the public pages will render with invalid colors.  
  **Suggested fix:** replace `--fg` → `--txt` and `--fg2` → `--txt2`.

- **[app/(public)/poetry/page.tsx:34] Uses undefined CSS variables `var(--fg)` / `var(--fg2)` throughout.** This breaks text coloring on the Poetry index page.  
  **Suggested fix:** replace with the defined text tokens.

- **[app/(public)/tech/page.tsx:91] Hardcoded hex colors are used directly in component styles.** The project rules explicitly forbid hardcoded hex values in component styles, and this page uses `#9FE1CB` repeatedly.  
  **Suggested fix:** replace with existing CSS variables such as `var(--teal-light)`.

- **[app/(public)/ideas/page.tsx:73] Uses undefined CSS variables `var(--fg)` / `var(--fg2)` throughout.** This page relies on non-existent tokens, so colors will not resolve as intended.  
  **Suggested fix:** replace with `var(--txt)` / `var(--txt2)`.

- **[package.json:8] `lint` script uses `next lint`, which is removed/deprecated in newer Next 15 setups and conflicts with ESLint 9 flat-config expectations.** In this repo there is also no ESLint config file shown, so the script is unlikely to work reliably.  
  **Suggested fix:** switch to `eslint .` with an explicit ESLint config.

- **[src/index.js:1] Stub file appears unused and unrelated to the Next app.** It adds noise and suggests a second entrypoint that does not exist.  
  **Suggested fix:** remove it unless an external tool requires it.

---

## Test Coverage

### Untested code paths

- **`app/api/auth/route.ts`**
  - malformed JSON body
  - missing email/password
  - invalid credentials
  - successful login
  - sign-out error path

- **`app/api/comments/route.ts`**
  - honeypot short-circuit
  - missing Turnstile token
  - failed Turnstile verification
  - invalid email
  - too-short body
  - unpublished post rejection
  - invalid parent comment
  - cross-post parent rejection
  - nested reply rejection once one-level enforcement is added
  - successful pending insert

- **`app/api/posts/route.ts`**
  - GET with invalid `type`
  - GET with default, NaN, negative, and oversized `limit`
  - unauthenticated POST
  - authenticated non-admin POST rejection once authz is added
  - invalid `type` on POST
  - duplicate slug conflict
  - `publishedAt` set only when `published === true`

- **`components/shared/CommentForm.tsx`**
  - API error rendering
  - network failure rendering
  - submit disabled state
  - success reset behavior
  - `onSuccess` callback
  - `onCancel` callback
  - section-specific copy/styles, especially Ideas font mismatch

- **Public section pages**
  - no rendering tests would currently catch the broken `SiteNav` import
  - no smoke tests would catch use of undefined CSS variables on public pages

- **`lib/utils/index.ts`**
  - `generateSlug`
  - date formatting helpers
  - `estimateReadTime`
  - `truncate`
  - `absoluteUrl`

### Suggested specific test cases

1. **Reject second-level reply**
   - Seed a post, a top-level approved/pending comment, and a reply to it.
   - Submit a new comment with `parentId` equal to the reply ID.
   - Expect `400` with a message indicating only one reply level is allowed.

2. **Posts GET rejects invalid type**
   - Request `/api/posts?type=invalid`.
   - Expect `400` instead of falling back to all posts.

3. **Public page smoke test for Home/Poetry/Tech/Ideas**
   - Render each page component.
   - Assert `SiteNav` import resolves and the page does not throw.

4. **CommentForm Ideas typography test**
   - Render `CommentForm` with `section="ideas"`.
   - Assert the helper/footer copy uses Source Serif 4, not Cormorant.

5. **Tech page style token test**
   - Render the Tech page and assert key hero/button colors use CSS variables (`var(--teal-light)`, `var(--teal-hero)`) rather than hardcoded hex values.

6. **Auth route malformed body**
   - Send invalid JSON to `POST /api/auth`.
   - Expect controlled `500` or `400`, depending on intended behavior, and no uncaught exception.

---

## Suggested Improvements

### 1) Enforce one-level reply depth

**Before**
```ts
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
```

**After**
```ts
if (parentId) {
  const [parent] = await db
    .select({
      id: comments.id,
      postId: comments.postId,
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

  if (parent.parentId) {
    return NextResponse.json(
      { success: false, error: 'Replies are limited to one level' },
      { status: 400 }
    )
  }
}
```

---

### 2) Fix broken `SiteNav` imports and invalid text tokens on public pages

**Before**
```tsx
import SiteNav from '@/components/shared/SiteNav';
...
color: 'var(--fg)',
```

**After**
```tsx
import { SiteNav } from '@/components/shared/SiteNav'
...
color: 'var(--txt)',
```

Apply the same replacement for `var(--fg2)` → `var(--txt2)` across:
- `app/(public)/page.tsx`
- `app/(public)/poetry/page.tsx`
- `app/(public)/tech/page.tsx`
- `app/(public)/ideas/page.tsx`

---

### 3) Remove hardcoded Tech page colors

**Before**
```tsx
color: '#9FE1CB',
border: '1px solid #9FE1CB',
```

**After**
```tsx
color: 'var(--teal-light)',
border: '1px solid var(--teal-light)',
```

This keeps the page aligned with the design rules and theme token system.

---

### 4) Fix Ideas comment footer typography

**Before**
```tsx
fontFamily:  isPoetry || isIdeas ? 'var(--font-cormorant), serif' : 'var(--font-dm-mono), monospace',
```

**After**
```tsx
fontFamily: isPoetry
  ? 'var(--font-cormorant), serif'
  : isIdeas
    ? 'var(--font-source-serif), serif'
    : 'var(--font-dm-mono), monospace',
```

---

### 5) Tighten post type validation on GET

**Before**
```ts
const type  = searchParams.get('type') as PostType | null
const conditions = [eq(posts.published, true)]
if (type) conditions.push(eq(posts.type, type))
```

**After**
```ts
const rawType = searchParams.get('type')
const allowedTypes: PostType[] = ['poetry', 'tech', 'ideas']

if (rawType && !allowedTypes.includes(rawType as PostType)) {
  return NextResponse.json(
    { success: false, error: 'Invalid post type' },
    { status: 400 }
  )
}

const conditions = [eq(posts.published, true)]
if (rawType) conditions.push(eq(posts.type, rawType as PostType))
```

---

Biggest priorities: fix the broken public page imports/tokens, enforce real admin authorization on post creation, and add one-level reply validation to comments.