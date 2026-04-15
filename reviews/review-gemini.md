## Security Findings

### [CRITICAL] XSS: Stored Cross-Site Scripting via User-Controlled HTML Content
**Description:** The application stores and renders user-supplied HTML content (`post.body` / `post.content`) without proper sanitization. This allows an attacker to inject malicious scripts, which will execute when other users view the affected content (e.g., blog posts, comments).

Specifically:
1.  **Post Content:**
    *   In `app/(public)/ideas/[slug]/page.tsx`, `post.body` is rendered using `dangerouslySetInnerHTML`.
    *   In `app/(public)/tech/[slug]/page.tsx`, `block.text` within `post.body` (of type `paragraph`, `code