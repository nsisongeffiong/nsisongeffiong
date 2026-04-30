/**
 * migrate-disqus-comments.ts
 *
 * Step 1: Run parse-disqus.py to generate disqus-comments.json
 * Step 2: Run this script to import into DB
 *
 * Run:
 *   python3 scripts/parse-disqus.py <path-to-export.xml.gz> > disqus-comments.json
 *   npx tsx --env-file=.env scripts/migrate-disqus-comments.ts
 */

import { db } from '../lib/db'
import { posts, comments } from '../lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { readFileSync } from 'fs'

const PLACEHOLDER_EMAIL = 'legacy@disqus.import'

type DisqusThread = {
  threadId:  string
  slug:      string
  title:     string
  comments:  DisqusComment[]
}

type DisqusComment = {
  disqusId:  string
  parentId:  string | null
  name:      string
  email:     string
  body:      string
  createdAt: string
}

type ParsedExport = { threads: DisqusThread[] }

async function main() {
  console.log('── Disqus → DB comment migration ───────────────────────────')

  const jsonPath = process.argv[2] ?? './disqus-comments.json'
  const data: ParsedExport = JSON.parse(readFileSync(jsonPath, 'utf8'))

  const totalComments = data.threads.reduce((n, t) => n + t.comments.length, 0)
  console.log(`\nLoaded ${data.threads.length} threads, ${totalComments} comments`)

  // Load DB posts by slug
  const slugsNeeded = data.threads.map(t => t.slug)
  const dbPosts = await db
    .select({ id: posts.id, slug: posts.slug })
    .from(posts)
    .where(inArray(posts.slug, slugsNeeded))

  const postBySlug = new Map(dbPosts.map(p => [p.slug, p.id]))

  let totalImported = 0
  let totalSkipped  = 0

  for (const thread of data.threads) {
    const postId = postBySlug.get(thread.slug)
    if (!postId) {
      console.log(`  SKIP  [${thread.slug}] — no matching post (${thread.comments.length} comments)`)
      totalSkipped += thread.comments.length
      continue
    }

    console.log(`\n  ── ${thread.title} [${thread.slug}] (${thread.comments.length} comments)`)

    // Sort by date so parents always exist before children
    const sorted = [...thread.comments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    const disqusToDb = new Map<string, string>()

    for (const c of sorted) {
      const parentDbId = c.parentId ? (disqusToDb.get(c.parentId) ?? null) : null

      const [inserted] = await db.insert(comments).values({
        postId,
        parentId:    parentDbId,
        authorName:  c.name || 'Anonymous',
        authorEmail: c.email || PLACEHOLDER_EMAIL,
        body:        c.body,
        status:      'approved',
        createdAt:   new Date(c.createdAt),
        updatedAt:   new Date(c.createdAt),
      }).returning()

      disqusToDb.set(c.disqusId, inserted.id)
      totalImported++
      console.log(`    [${c.createdAt.slice(0,10)}] ${c.name}${parentDbId ? ' (reply)' : ''}`)
    }
  }

  // Disable legacyDisqus on all posts
  console.log('\n── Disabling legacyDisqus on all posts…')
  const allPosts = await db.select({ id: posts.id, metadata: posts.metadata }).from(posts)
  for (const p of allPosts) {
    await db.update(posts).set({
      metadata: { ...(p.metadata as Record<string, unknown> ?? {}), legacyDisqus: false },
    }).where(eq(posts.id, p.id))
  }
  console.log(`  Updated ${allPosts.length} posts`)

  console.log(`
── Summary ──────────────────────────────────────────────────
  Imported: ${totalImported} comments
  Skipped:  ${totalSkipped} comments (no matching post)
── Done ─────────────────────────────────────────────────────`)

  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
