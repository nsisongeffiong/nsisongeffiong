I have performed a security-focused code audit of the provided Next.js application, treating it as a fresh, independent review. My analysis covers security, correctness, and dependency risks, along with a compliance checklist.

## Security Findings

**[HIGH] Broken Access Control (CWE-284) – Unrestricted Post Creation**
*   **Description**: The `POST /api/posts` endpoint, intended for "admin only" operations (as stated in `CONTEXT.md` and `app/api/posts/route.ts` comment), currently only verifies that *any* user is authenticated via Supabase (`supabase.auth.getUser()`). There is no further authorization check to confirm if the authenticated user has administrative privileges (e.g., a specific role, or is on