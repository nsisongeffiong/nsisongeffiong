The following is a comprehensive security and correctness audit of the provided codebase.

## Security Findings

---

**[CRITICAL] Broken Access Control (CWE-284) – Unrestricted Post Creation**
*   **Description**: The `POST /api/posts` endpoint is intended for "admin only" operations as indicated by comments in `CONTEXT.md` and `app/api/posts/route.ts`. However, the current implementation only verifies that *any* user is authenticated via Supabase (`supabase.auth.getUser()`). There is no further authorization check to confirm if the authenticated user has administrative privileges (e.g., a specific role, or is on an allowlist). This allows any logged-in user to create new blog posts, which is a critical breach