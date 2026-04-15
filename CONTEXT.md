# nsisongeffiong.com — Project Context

Read this file at the start of every session to understand the full design
and architecture of this project before writing any code.

---

## What this site is

A personal website for Nsisong Effiong — writer, engineer, and public thinker.
Three distinct content sections live under one roof, each with its own design
personality. The site is built with Next.js 15, Supabase (PostgreSQL + Auth),
Drizzle ORM, Tailwind CSS, and next-themes.

---

## Section personalities

### Poetry
- Font: Cormorant Garamond (italic, weight 300–400)
- Accent: Purple — `#534AB7` (light) / `#AFA9EC` (dark)
- Section page: large italic hero title, featured poem with verse excerpt,
  two-column poem card grid with category filters
- Single post: centered narrow column, title + ornamental rule (dot-centred
  line), verse with deliberate indentation using padding-left, poet's note
  below endmark (· · ·), prev/next navigation in italic
- Comment form: borderless underline inputs, Cormorant italic throughout,
  submit button with purple border, centred layout
- No poem numbering — was considered and rejected

### Tech
- Font: DM Mono (monospace) for chrome, Syne for headings
- Accent: Teal — hero background `#04342C`, mid `#1D9E75`
- Section page: dark green hero with `# engineering blog` comment and
  `./tech` heading, filter chips, numbered article list, stats bar
- Single post: dark green hero with tags + title + meta, two-column layout
  (article body + ToC sidebar), code blocks in dark green, callout boxes
  with teal left border, `$ submit` terminal-style button
- Comment form: DM Mono throughout, bordered inputs on `var(--bg2)`,
  avatar initials square (not circle), `$ reply` and `$ submit` labels
- Section is called "Tech" not "Technical" everywhere

### Ideas & Policy
- Font: Syne (headings, 700–800) + Source Serif 4 (body, weight 300–400 italic)
- Accent: Amber — `#BA7517` (light) / `#EF9F27` (dark)
- Section page: bold Syne masthead "Ideas" at ~80px, volume/issue label,
  lead essay + sidebar layout, full-width amber pull quote strip, topic filters,
  three-column essay card grid
- Single post: single clean column (no sidebar), drop cap on lede paragraph,
  floating pull quotes (float: left/right, ~41% width) that interrupt text
  flow with text wrapping around them, centred full-width pull quote for
  signature quote, Roman numeral section break rules (I. / II.)
- Essays are organised into Volumes by year (Vol. I = 2025, Vol. II = 2026 etc.)
- Each essay has a `kicker` — a short editorial label above the title
  (e.g. "Technology & governance") — and a `volume` in metadata
- Comment form: Source Serif 4 italic body text, underline inputs,
  amber border submit button, "Leave a response" / "Submit response" labels,
  volume shown in comment count ("2 responses · Vol. I")

---

## Colour tokens

### Light mode
```
--bg:          #F7F5F0   (warm parchment, not pure white)
--bg2:         #EEEAE0
--bg3:         #E5E0D4
--txt:         #1C1C18
--txt2:        #5C5B54
--txt3:        #9C9B90
--bdr:         rgba(28,28,24,0.1)
--bdr2:        rgba(28,28,24,0.2)
--purple:      #534AB7
--purple-bg:   #EEEDFE
--purple-txt:  #3C3489
--purple-acc:  #AFA9EC
--teal-hero:   #04342C
--teal-mid:    #1D9E75
--teal-light:  #5DCAA5
--teal-pale:   #E1F5EE
--teal-txt:    #085041
--teal-comm:   #0F6E56
--amber:       #BA7517
--amber-bg:    #FDF6E8
--amber-txt:   #7A4A0A
--amber-pq:    #FDF0D4
--amber-pq-txt:#5C3608
```

### Dark mode (.dark class)
```
--bg:          #0E0E0C   (near-black, not generic dark grey)
--bg2:         #181815
--bg3:         #1E1E1A
--txt:         #F0EFE8
--txt2:        #A8A89E
--txt3:        #606058
--bdr:         rgba(240,239,232,0.1)
--bdr2:        rgba(240,239,232,0.2)
--purple:      #AFA9EC
--purple-bg:   #26215C
--purple-txt:  #CECBF6
--purple-acc:  #7F77DD
--teal-hero:   #021F1A
--teal-mid:    #5DCAA5
--teal-light:  #9FE1CB
--teal-pale:   #085041
--teal-txt:    #9FE1CB
--amber:       #EF9F27
--amber-bg:    #2C1D06
--amber-txt:   #FAC775
--amber-pq:    #2C1D06
--amber-pq-txt:#FAC775
```

---

## Fonts

All loaded via next/font/google with CSS variables:

| Variable              | Font                | Used for                        |
|-----------------------|---------------------|---------------------------------|
| --font-cormorant      | Cormorant Garamond  | Poetry — all text               |
| --font-syne           | Syne                | Tech headings, Ideas headings,  |
|                       |                     | site nav, admin                 |
| --font-dm-mono        | DM Mono             | Tech body, code blocks, admin   |
| --font-source-serif   | Source Serif 4      | Ideas body text                 |

---

## Database schema

### posts
```
id           uuid PK defaultRandom
type         enum('poetry','tech','ideas') NOT NULL
title        text NOT NULL
slug         text NOT NULL UNIQUE
content      text NOT NULL
excerpt      text
tags         text[]
published    boolean default false
published_at timestamptz
metadata     jsonb
created_at   timestamptz defaultNow
updated_at   timestamptz defaultNow
```

#### metadata jsonb shapes by type

Poetry:
```json
{
  "category": "Nature & place",
  "poetNote": "Written after...",
  "legacyDisqus": true
}
```

Tech:
```json
{
  "readTime": 12,
  "featured": true,
  "codeLanguages": ["python", "bash"],
  "legacyDisqus": false
}
```

Ideas:
```json
{
  "kicker": "Technology & governance",
  "volume": "Vol. I",
  "featured": true,
  "legacyDisqus": false
}
```

`legacyDisqus: true` means render Disqus embed (pre-migration Ghost posts).
`legacyDisqus: false` or absent means render native comment system.

### comments
```
id           uuid PK defaultRandom
post_id      uuid FK → posts.id ON DELETE CASCADE
parent_id    uuid nullable FK → comments.id (one level of replies only)
author_name  text NOT NULL
author_email text NOT NULL (stored, never displayed publicly)
body         text NOT NULL
status       enum('pending','approved','rejected') default 'pending'
created_at   timestamptz defaultNow
updated_at   timestamptz defaultNow
```

---

## Comment system

Three-layer spam protection on every submission:

1. **Honeypot** — hidden `website` field in the form. If filled → drop silently,
   return fake success so bots don't know they were caught.
2. **Cloudflare Turnstile** — invisible challenge. Token verified server-side
   against `TURNSTILE_SECRET_KEY` before any DB write.
3. **Manual moderation** — all comments saved as `status: 'pending'`.
   Nothing appears publicly until approved in `/admin/comments`.

**Future (not yet implemented):**
- Email verification — confirm real inbox before entering moderation queue
- Disqus XML export → migrate legacy comments into native DB

---

## Theme system

- `next-themes` with `defaultTheme="system"` and `enableSystem`
- System preference is the default — no forced theme on load
- `ThemeToggle` component cycles: system → light → dark → system
- Toggle is an override, not the primary control
- CSS classes: `.dark` on `<html>` for dark mode

---

## Migration from Ghost

- Current site runs Ghost on Azure
- All existing posts are poetry (2013–2016)
- `scripts/migrate-ghost.ts` reads Ghost JSON export and inserts posts
  with `type: 'poetry'` and `metadata.legacyDisqus: true`
- Existing slugs preserved so all URLs remain identical (no broken links)
- Disqus comments tied to URLs — same domain + same slugs = comments
  load automatically with no action needed
- RSS feed at `/api/rss` preserves existing Feedly subscribers

---

## App structure

```
app/
  layout.tsx                    root layout — fonts + ThemeProvider
  globals.css                   CSS token system (light + dark)
  (public)/
    page.tsx                    landing page
    poetry/
      page.tsx                  poetry section
      [slug]/page.tsx           single poem + comments
    tech/
      page.tsx                  tech section
      [slug]/page.tsx           single article + comments
    ideas/
      page.tsx                  ideas section
      [slug]/page.tsx           single essay + comments
  (admin → admin)/
    layout.tsx                  admin wrapper
    login/page.tsx              Supabase Auth sign in
    dashboard/page.tsx          overview stats
    posts/
      page.tsx                  all posts list
      new/page.tsx              Tiptap editor — new post
      [id]/page.tsx             Tiptap editor — edit post
    comments/page.tsx           moderation queue
  api/
    posts/route.ts              GET list, POST create (admin only)
    comments/route.ts           GET approved, POST with spam protection
    auth/route.ts               POST sign in, DELETE sign out
    rss/route.ts                RSS XML feed
middleware.ts                   auth guard — protects /admin/*
components/
  shared/
    SiteNav.tsx                 top nav with active link + ThemeToggle
    ThemeToggle.tsx             system/light/dark cycle button
    DisqusComments.tsx          legacy embed for legacyDisqus posts
    CommentForm.tsx             native form — styled per section
  landing/                      landing page components
  poetry/                       poetry section components
  tech/                         tech section components
  ideas/                        ideas section components
  admin/                        admin UI components
lib/
  db/
    schema.ts                   Drizzle schema
    index.ts                    Drizzle client (pooled connection)
  supabase/
    client.ts                   browser client
    server.ts                   server client
  utils/
    index.ts                    cn, generateSlug, formatDate,
                                estimateReadTime, absoluteUrl
types/
  index.ts                      shared types, NAV_LINKS, SECTIONS config
drizzle/
  migrations/                   generated migration SQL files
scripts/
  migrate-ghost.ts              Ghost JSON → Supabase migration
```

---

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL           (direct — for migrations)
DATABASE_URL_POOLED    (pooled — for runtime)
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
NEXT_PUBLIC_DISQUS_SHORTNAME
```

---

## Key rules

- Never use `#04342C` directly — always `var(--teal-hero)`
- Never use hardcoded hex values in component styles — always CSS variables
- Section is "Tech" not "Technical" everywhere in UI, labels, and nav
- Poetry posts have no numbers — the poem number feature was rejected
- The Ideas section uses "kicker" for the label above the essay title,
  and "volume" for the year-based collection (Vol. I, Vol. II etc.)
- All comments enter as `status: 'pending'` — nothing auto-publishes
- `legacyDisqus: true` in metadata → render DisqusComments component
- `legacyDisqus: false` or absent → render native CommentForm
- Admin routes are protected by middleware.ts — never add client-side
  auth checks as a substitute for the server-side guard
- Honeypot field is named `website` — return fake success when filled,
  never reveal to the submitter that it was caught
