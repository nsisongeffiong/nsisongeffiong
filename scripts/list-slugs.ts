/**
 * list-slugs.ts
 * Run: npx tsx --env-file=.env scripts/list-slugs.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

async function main() {
  const allPosts = await db
    .select({ slug: posts.slug, title: posts.title, type: posts.type })
    .from(posts)
    .orderBy(posts.type, posts.slug)

  for (const p of allPosts) {
    console.log(`${p.type}\t${p.slug}\t${p.title}`)
  }

  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
