# Claude Coder — nsisongeffiong.com

You are the code implementation agent for nsisongeffiong.com. Before writing
any code, read CONTEXT.md in the project root to understand the full design
system, component personalities, and architecture decisions.

## Stack
Next.js 15 App Router · Supabase (PostgreSQL + Auth) · Drizzle ORM ·
Tailwind CSS · next-themes · Tiptap editor · TypeScript throughout

## Output rules
- Every code file block MUST have its filepath on the opening fence line
- Example: ```tsx components/poetry/PoetryCard.tsx
- Split large tasks into focused files — never one giant file
- Do NOT rewrite files not explicitly listed in the task

## File modification rules
- For ANY file change — always use exact string replacement
- Always read the file before modifying to confirm the exact pattern exists
- NEVER use positional arithmetic — use exact string matching

## Design rules
- NEVER hardcode hex values — always use CSS variables (e.g. `var(--teal-hero)`)
- NEVER use generic fonts — always use the font variables:
  `var(--font-cormorant)`, `var(--font-syne)`, `var(--font-dm-mono)`,
  `var(--font-source-serif)`
- Section is "Tech" not "Technical" in all UI text, labels, and navigation
- Poetry posts have NO poem numbers
- ThemeToggle cycles: system → light → dark → system (three states, not two)

## Section personality rules

### Poetry components
- Font: `var(--font-cormorant), serif` — italic weight 300
- All inputs: borderless, underline only (`border-bottom: 0.5px solid var(--bdr2)`)
- Buttons: purple border `var(--purple-acc)`, centred, no background
- Layout: centred narrow column, generous vertical rhythm
- Comment count label uses plural "responses" not "comments"

### Tech components
- Font: `var(--font-dm-mono), monospace` for body, `var(--font-syne)` for headings
- Hero background: `var(--teal-hero)` — NEVER any other background colour
- Inputs: bordered, `border: 0.5px solid var(--bdr2)`, `background: var(--bg2)`
- Submit button: `background: var(--teal-hero)`, colour `#9FE1CB`, `$ submit` label
- Reply button: `$ reply` label
- Code blocks: `background: var(--teal-hero)`, colour `#9FE1CB`

### Ideas components
- Font: `var(--font-source-serif), serif` for body, `var(--font-syne)` for headings
- All inputs: borderless, underline only — same as poetry
- Submit button: amber border `var(--amber)`, colour `var(--amber)`, no background
- Pull quotes on single post: float left/right at 41% width — NOT in a sidebar
- Section breaks: Roman numerals (I. / II. / III.) with horizontal rules
- Drop cap on lede paragraph using `::first-letter` pseudo-element
- Comment count includes volume: "2 responses · Vol. I"
- Essays have `kicker` (label above title) and `volume` (year collection)

## Comment system rules
- Honeypot field named `website` — hidden, `display: none`, `tabIndex={-1}`
- If honeypot filled → return `{ success: true, data: { pending: true } }` (fake success)
- Turnstile token verified AFTER honeypot check, BEFORE any DB write
- All comments saved as `status: 'pending'` — NEVER auto-approve
- `metadata.legacyDisqus === true` → render `<DisqusComments />` component
- `metadata.legacyDisqus` absent or false → render `<CommentForm />` component

## Database rules
- Always use Drizzle ORM — never raw SQL in application code
- Use pooled connection (`DATABASE_URL_POOLED`) for runtime queries
- Use direct connection (`DATABASE_URL`) for migrations only
- All admin API routes must verify Supabase session before any DB operation

## Script rules
- All scripts: `set -euo pipefail`
- Build failure must exit before git commit
- Always use `git push origin HEAD` not bare `git push`
- Add idempotency guards — scripts must be safe to run twice

## Security rules
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client (no `NEXT_PUBLIC_` prefix)
- Never expose `TURNSTILE_SECRET_KEY` to the client
- Admin routes are protected by `middleware.ts` — do not add redundant
  client-side auth checks
- Never log `authorEmail` values anywhere
