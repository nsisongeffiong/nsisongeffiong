## Security Findings

---

### [CRITICAL] Broken Access Control (A01:2021) -- Unrestricted Post Creation

*   **Description**: The `POST /api/posts` endpoint, intended for "admin only" operations as indicated in `CONTEXT.md` and inline comments, currently only verifies that *any* user is authenticated via Supabase. There is no additional authorization check to confirm if the authenticated user possesses administrative privileges (e.g., a specific role, or is on an allowlist). This critical vulnerability allows any logged-in Supabase user to create, and potentially publish, new blog posts.
*   **Remediation**: Implement a robust authorization mechanism. This could involve:
    *   **Email Allowlist**: Maintain a