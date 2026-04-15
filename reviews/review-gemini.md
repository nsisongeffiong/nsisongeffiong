As a security-focused code auditor, I've conducted a fresh, independent review of the provided codebase, considering the project context and security guidelines.

---

## Security Findings

### [HIGH] Broken Access Control (A01:2021) — Unrestricted Post Creation
*   **Description**: The `POST /api/posts` API route (in `app/api/posts/route.ts`) is explicitly marked as "admin only" within `CONTEXT.md` and by an inline `TODO` comment. However, the current implementation only verifies that *any* user is authenticated via Supabase (`supabase.auth.getUser()`). There is no check to determine if the authenticated user has administrative privileges. This means any logged-in user could create new posts, leading to