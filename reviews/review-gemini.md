The following is a security-focused code audit of the provided codebase.

---

## Security Findings

### [CRITICAL] Broken Access Control (A01:2021) -- Unrestricted Post Creation
*   **Description**: The `POST /api/posts` API route, intended for "admin only" operations as indicated in `CONTEXT.md` and the inline `TODO` comment within the code, only verifies that *any* user is authenticated via Supabase (`supabase.auth.getUser()`). There is no additional authorization check (e.g., checking for a specific user role, an email allowlist, or Supabase custom claims/RLS) to ensure that the authenticated user has administrative privileges. This critical vulnerability allows any logged-in Supabase user to create,