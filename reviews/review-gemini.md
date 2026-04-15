## Security Findings

### [CRITICAL] Broken Access Control (A01:2021) -- Unrestricted Post Creation
*   **Description**: The `POST /api/posts` endpoint allows any authenticated Supabase user to create new posts. The `CONTEXT.md` explicitly states this route is "admin only," and an inline `TODO` comment in the code highlights this missing authorization check. Without proper admin role verification, a malicious or compromised user account could create, modify, or delete content, severely undermining the site's integrity.
*   **Remediation**: Implement a robust server-side authorization check to ensure only designated administrators can create posts. This could involve:
    1.  **Email Allowlist**: Maintain a list of allowed admin email addresses (e.g., in an environment variable `ADMIN_EMAILS`) and verify `user.email` against this list.
    2.  **Supabase Custom Claims/Roles**: Assign an `admin` role via Supabase custom claims and check for this claim in the user's JWT.
    3.  **Row Level Security (RLS)**: Implement RLS policies on the `posts` table that restrict insert operations to users with a specific role.
    *The provided `reviews/gpt.md` includes a proposed fix using an email allowlist in the `Suggested Improvements` section, which is a good starting point.*

### [MEDIUM] Cross-Site Scripting (XSS) (A03:2021) -- `dangerouslySetInnerHTML` in `/ideas/[slug]`
*   **Description**: The `app/(public)/ideas/[slug]/page.tsx` component uses `dangerouslySetInnerHTML` to render `post.body` directly from a static `post` object. While currently only static placeholder data is used, if `post.body` were to be fetched from a database without proper sanitization (e.g., from an admin's Tiptap editor), it would introduce a severe XSS vulnerability. An attacker could inject malicious scripts that execute in the user's browser, leading to session hijacking, data theft, or defacement.
*   **Remediation**: Before content from the database is used with `dangerouslySetInnerHTML`, it must be thoroughly sanitized. Consider using a library like `DOMPurify` (on the server-side, if possible, or client-side with careful hydration considerations) to strip out potentially malicious HTML tags and attributes. Alternatively, use a rendering library that can safely convert HTML to React elements without direct `innerHTML` manipulation.
*   **Note**: The `final-review.md` correctly notes this as a valid XSS concern for *future DB-backed content* but not actionable *now* due to placeholder data. This is a critical item to address when dynamic content is introduced.

### [LOW] Insufficient Input Validation -- Missing `name` length constraint in `POST /api/comments`
*   **Description**: The `POST /api/comments` endpoint validates `authorName`, `authorEmail`, and `bodyText` for emptiness (`.trim()`) and email format. However, there's no explicit length constraint for `authorName` or `bodyText` beyond being non-empty. While `bodyText` is somewhat constrained by UI considerations, a very long `authorName` could potentially impact database storage, display, or even lead to denial-of-service in certain rendering contexts.
*   **Remediation**: Add explicit maximum length validations for `authorName` and `bodyText` in `app/api/comments/route.ts` to align with schema definitions (`varchar(100)` for authorName and `text` for body, though `text` doesn't have an inherent max length and could be arbitrarily large). Ensure these limits are consistent with the database schema and UI expectations.

## Correctness Issues

### `window.turnstileToken` dependency prevents comment submission
*   **Description**: The `CommentForm.tsx` component relies on `window.turnstileToken` to be present and populated for comment submissions. However, no Turnstile widget is rendered in the provided code that would populate this global variable. As a result, the `if (!turnstileToken)` check will always trigger, leading to the error "Verification is not ready yet. Please try again later.", effectively preventing any legitimate comment submission.
*   **Remediation**: The Cloudflare Turnstile widget needs to be correctly integrated and rendered in the page containing the `CommentForm`. The token should ideally be captured via a callback from the widget component and stored in component state, then passed to the API call. This removes the implicit global dependency and makes the form functional.
*   **Note**: `reviews/gpt.md` flags this as "real comment submission cannot succeed" and `final-review.md` rejects the fix of moving to component state, stating it's "premature for incomplete feature". This issue remains unaddressed and currently renders the comment form unusable.

## Dependency Risks

### `next@15.0.0` flagged as vulnerable
*   **Description**: The `package-lock.json` explicitly flags `next@15.0.0` as having a security vulnerability (CVE-2025-66478).
*   **Remediation**: Upgrade `next` to a patched version (e.g., `15.0.1` or later, as recommended by the Next.js blog or official security advisories) and carefully test the application.
*   **Note**: This is correctly escalated in `reviews/final-review.md` and requires action.

## Compliance Checklist

*   [ ] No hardcoded secrets
    *   **Finding**: All sensitive keys are correctly listed in `.env.example` and are accessed via `process.env`. `SUPABASE_SERVICE_ROLE_KEY` is not exposed with `NEXT_PUBLIC_` prefix, which is good.
*   [x] Input validation present
    *   **Finding**: Input validation is present in `app/api/comments/route.ts` (for `postId`, `authorName`, `authorEmail`, `bodyText`, `parentId` checks, email regex) and `app/api/posts/route.ts` (for `title`, `type`, `content`, `type` enum check). One minor missing validation is length constraints on `authorName` and `bodyText` in comments.
*   [x] Error handling present
    *   **Finding**: `try...catch` blocks are used in all API routes (`/api/auth`, `/api/comments`, `/api/posts`, `/api/rss`) to handle exceptions and return structured `NextResponse.json({ success: false, error: ... })` messages with appropriate HTTP status codes.
*   [ ] Logging does not expose PII
    *   **Finding**: `console.error` calls in API routes primarily log the `error` object itself or a generic message. The `authorEmail` is stored in the DB but not exposed publicly or explicitly logged. However, care should be taken to ensure the `error` object itself (especially if it's a full stack trace or a database error) does not inadvertently contain or log sensitive PII (like email addresses from a failed login attempt) to external logs accessible by non-privileged personnel.
*   [x] No SQL/command injection vectors
    *   **Finding**: Drizzle ORM is consistently used for database interactions, which inherently protects against SQL injection. There are no direct command execution points identified. The `dangerouslySetInnerHTML` noted above is an XSS vector, not a SQL/command injection vector in this context, but represents a content injection risk.

---

## C. Final Review Summary

### Summary of Changes Applied

### 1. Tech hero title — hardcoded `#E1F5EE` → `var(--teal-pale)`
**File:** `app/(public)/tech/[slug]/page.tsx`
- `#E1F5EE` matches `--teal-pale` in light mode. Using the CSS variable ensures proper dark mode adaptation.

### 2. Tech code blocks — hardcoded `#9FE1CB` → `var(--teal-light)`
**File:** `app/(public)/tech/[slug]/page.tsx`
- Inline code `<pre>` blocks now use `var(--teal-light)` instead of hardcoded hex.
- `--teal-light` resolves to `#5DCAA5` (light) / `#9FE1CB` (dark), both appropriate on `--teal-hero` backgrounds.

### 3. Tiptap pre color — hardcoded `#9FE1CB` → `var(--teal-light)`
**File:** `app/globals.css`
- `.tiptap pre` color changed from `#9FE1CB` to `var(--teal-light)` for consistency with the token system.

### 4. Local slugify replaced with shared utility
**File:** `app/(public)/tech/[slug]/page.tsx`
- Removed local `function slugify()` definition.
- Added `import { generateSlug } from '@/lib/utils'`.
- Prevents divergent slug generation between UI and API.

### 5. Poetry comment count derived from rendered data
**File:** `app/(public)/poetry/[slug]/page.tsx`
- Removed hardcoded `post.commentCount` (was `3`, actual data has `3` but could drift).
- Added `commentCount` computed from `comments.reduce()`, matching the pattern used in the ideas page.
- Removed `commentCount` from the `post` object.

### Escalated Items

### [CRITICAL] [HUMAN REVIEW NEEDED] Admin Authorization on POST /api/posts
Both GPT and Gemini flagged this. Any authenticated Supabase user can create posts — no admin role check exists.

**Current state:** Code has a TODO comment acknowledging this.

**Recommended approaches:**
1.  **Email allowlist** — `ADMIN_EMAILS` env var
2.  **Supabase custom claims** — admin role in JWT
3.  **Supabase RLS** — Row Level Security on `posts` table

**Why escalated:** Architecture decision needed before implementation. This is a critical security vulnerability.

### [CRITICAL] [HUMAN REVIEW NEEDED] Next.js Security Vulnerability
`next@15.0.0` has CVE-2025-66478. Upgrade to patched release recommended. Requires dependency testing.

### [MEDIUM] [HUMAN REVIEW NEEDED] XSS via `dangerouslySetInnerHTML` in `ideas/[slug]`
The `ideas/[slug]` page uses `dangerouslySetInnerHTML` for the post body. While current data is static,