import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { writeFileSync } from 'fs'

async function exportDrafts() {
  const rows = await db
    .select({
      title: posts.title,
      slug: posts.slug,
      content: posts.content,
      excerpt: posts.excerpt,
      metadata: posts.metadata,
      tags: posts.tags,
    })
    .from(posts)
    .where(and(eq(posts.type, 'ideas'), eq(posts.published, false)))

  writeFileSync('/tmp/ideas-drafts.json', JSON.stringify(rows, null, 2))
  console.log(`${rows.length} draft ideas posts exported to /tmp/ideas-drafts.json`)
  process.exit(0)
}

exportDrafts()
