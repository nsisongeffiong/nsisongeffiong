/**
 * backfill-word-counts.ts
 *
 * Strips HTML from content, counts words, computes read time,
 * and writes wordCount + readTime into metadata for every post.
 *
 * Run: npx tsx --env-file=.env scripts/backfill-word-counts.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

function computeContentStats(html: string): { wordCount: number; readTime: number } {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = text ? text.split(' ').length : 0
  const readTime = Math.max(1, Math.round(wordCount / 200))
  return { wordCount, readTime }
}

async function main() {
  console.log('── Backfilling word counts ──────────────────────────────────')

  const allPosts = await db.select({
    id:       posts.id,
    title:    posts.title,
    content:  posts.content,
    metadata: posts.metadata,
  }).from(posts)

  console.log(`  Found ${allPosts.length} posts\n`)

  for (const post of allPosts) {
    const { wordCount, readTime } = computeContentStats(post.content ?? '')

    await db.update(posts)
      .set({
        metadata: {
          ...(post.metadata as Record<string, unknown> ?? {}),
          wordCount,
          readTime,
        },
      })
      .where(eq(posts.id, post.id))

    console.log(`  [${post.title.slice(0, 50)}] → ${wordCount} words, ${readTime} min`)
  }

  console.log('\n── Done ─────────────────────────────────────────────────────')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
