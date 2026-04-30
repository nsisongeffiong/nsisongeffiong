/**
 * seed-missing-legacy-posts.ts
 *
 * Creates 4 draft poetry posts for old WordPress-era content
 * that has Disqus comments but no matching DB post.
 *
 * Run: npx tsx --env-file=.env scripts/seed-missing-legacy-posts.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const MISSING_POSTS = [
  {
    slug:  'indecision',
    title: 'Indecision',
  },
  {
    slug:  'sunrise',
    title: 'Sunrise',
  },
  {
    slug:  'clouds-grumbling-off-the-horizon',
    title: 'Clouds Grumbling off the Horizon',
  },
  {
    slug:  'nightfall',
    title: 'Nightfall',
  },
]

async function main() {
  console.log('── Creating missing legacy posts ────────────────────────────')

  for (const p of MISSING_POSTS) {
    // Skip if already exists
    const [existing] = await db.select({ id: posts.id })
      .from(posts).where(eq(posts.slug, p.slug)).limit(1)

    if (existing) {
      console.log(`  SKIP  ${p.slug} (already exists)`)
      continue
    }

    const [created] = await db.insert(posts).values({
      type:      'poetry',
      title:     p.title,
      slug:      p.slug,
      content:   '',
      published: false,
      metadata:  { legacyDisqus: false },
    }).returning()

    console.log(`  OK    ${p.slug} → ${created.id}`)
  }

  console.log('\n── Done ─────────────────────────────────────────────────────')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
