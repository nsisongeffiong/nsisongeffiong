I have performed an independent security audit of the provided codebase. My review considers the project context, design rules, and security guidelines outlined in `CONTEXT.md` and `prompts/claude_coder.md`.

## Security Findings

### [CRITICAL] Broken Access Control (A01:2021) -- Unrestricted Post Creation
*   **Description**: The `POST /api/posts` API route, intended for "admin only" operations as explicitly stated in `CONTEXT.md` and by an inline `TODO` comment in `app/api/posts/route.ts`, only verifies that *any* user is authenticated via Supabase. There is no additional authorization check (e.g., checking for a specific user role, an email allowlist, or Supabase