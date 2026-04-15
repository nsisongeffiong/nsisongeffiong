/**
 * Ghost → Supabase migration script
 *
 * Usage:
 *   1. Export your Ghost content: Ghost Admin → Settings → Labs → Export content
 *   2. Save the JSON file as ghost-export.json in the project root
 *   3. Copy .env.example to .env and fill in DATABASE_URL
 *   4. Run: npx tsx scripts/migrate-ghost.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { generateSlug } from '../lib/utils'
import * as fs from 'fs'
import * as path from 'path'

type GhostPost = {
  id:           string
  title:        string
  slug:         string
  html:         string | null
  plaintext:    string | null
  custom_excerpt: string | null
  status:       string
  published_at: string | null
  tags?: { name: string }[]
}

type GhostExport = {
  db: [{
    data: {
      posts: GhostPost[]
    }
  }]
}

async function migrate() {
  const exportPath = path.join(process.cwd(), 'ghost-export.json')

  if (!fs.existsSync(exportPath)) {
    console.error('ghost-export.json not found in project root.')
    console.error('Export your content from Ghost Admin → Settings → Labs → Export content')
    process.exit(1)
  }

  const raw    = fs.readFileSync(exportPath, 'utf-8')
  const data   = JSON.parse(raw) as GhostExport
  const ghostPosts = data.db[0].data.posts

  console.log(`Found ${ghostPosts.length} posts in Ghost export`)

  let migrated = 0
  let skipped  = 0

  for (const ghost of ghostPosts) {
    // Only migrate published posts
    if (ghost.status !== 'published') {
      console.log(`  Skipping draft: "${ghost.title}"`)
      skipped++
      continue
    }

    const slug = ghost.slug || generateSlug(ghost.title)

    try {
      await db.insert(posts).values({
        type:        'poetry',          // All existing Ghost posts are poems — matches DB enum
        title:       ghost.title,
        slug,
        content:     ghost.html ?? ghost.plaintext ?? '',
        excerpt:     ghost.custom_excerpt ?? undefined,
        tags:        ghost.tags?.map((t) => t.name) ?? [],
        published:   true,
        publishedAt: ghost.published_at ? new Date(ghost.published_at) : new Date(),
        metadata: {
          legacyDisqus: true,           // Use Disqus embed for these posts
          category:     ghost.tags?.[0]?.name ?? undefined,
        },
      })

      console.log(`  ✓ Migrated: "${ghost.title}" → /poetry/${slug}`)
      migrated++
    } catch (error: any) {
      if (error?.code === '23505') {
        console.log(`  ↷ Already exists: "${ghost.title}" — skipping`)
        skipped++
      } else {
        console.error(`  ✗ Failed: "${ghost.title}"`, error.message)
      }
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`)
  process.exit(0)
}

migrate()
