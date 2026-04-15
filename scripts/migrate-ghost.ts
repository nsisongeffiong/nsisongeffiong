import 'dotenv/config'
/**
 * Ghost → Supabase migration script
 *
 * Usage:
 *   1. Export your Ghost content: Ghost Admin → Settings → Labs → Export content
 *   2. Save the JSON file as ghost-export.json in the project root
 *   3. Run: npx tsx scripts/migrate-ghost.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { generateSlug } from '../lib/utils'
import * as fs from 'fs'
import * as path from 'path'

type GhostPost = {
  id:             string
  title:          string
  slug:           string
  html:           string | null
  plaintext:      string | null
  custom_excerpt: string | null
  status:         string
  published_at:   string | null
  tags?: { name: string }[]
}

type GhostUser = {
  id:   string
  name: string
  slug: string
  email: string
}

type GhostPostAuthor = {
  id:         string
  post_id:    string
  author_id:  string
  sort_order: number
}

type GhostExport = {
  db: [{
    data: {
      posts:         GhostPost[]
      users:         GhostUser[]
      posts_authors: GhostPostAuthor[]
    }
  }]
}

async function migrate() {
  const exportPath = path.join(process.cwd(), 'ghost-export.json')

  if (!fs.existsSync(exportPath)) {
    console.error('ghost-export.json not found in project root.')
    process.exit(1)
  }

  const raw  = fs.readFileSync(exportPath, 'utf-8')
  const data = JSON.parse(raw) as GhostExport

  const ghostPosts   = data.db[0].data.posts
  const ghostUsers   = data.db[0].data.users         ?? []
  const postsAuthors = data.db[0].data.posts_authors ?? []

  // ── Build lookup maps ──────────────────────────────────────────────────────
  // user id → user object
  const userMap = new Map<string, GhostUser>(
    ghostUsers.map((u) => [u.id, u])
  )

  // post id → array of authors (sorted by sort_order)
  const postAuthorsMap = new Map<string, GhostUser[]>()
  for (const pa of postsAuthors.sort((a, b) => a.sort_order - b.sort_order)) {
    const user = userMap.get(pa.author_id)
    if (!user) continue
    if (!postAuthorsMap.has(pa.post_id)) {
      postAuthorsMap.set(pa.post_id, [])
    }
    postAuthorsMap.get(pa.post_id)!.push(user)
  }

  console.log(`Found ${ghostPosts.length} posts in Ghost export`)
  console.log(`Found ${ghostUsers.length} users: ${ghostUsers.map(u => u.name).join(', ')}`)
  console.log('')

  let migrated = 0
  let skipped  = 0
  let failed   = 0

  for (const ghost of ghostPosts) {
    const slug    = ghost.slug || generateSlug(ghost.title)
    const authors = postAuthorsMap.get(ghost.id) ?? []

    // Primary author (sort_order 0)
    const primaryAuthor = authors[0]

    // All authors for metadata
    const authorsMeta = authors.map((u) => ({
      name: u.name,
      slug: u.slug,
      email: u.email,
    }))

    try {
      await db.insert(posts).values({
        type:        'poetry',
        title:       ghost.title,
        slug,
        content:     ghost.html ?? ghost.plaintext ?? '',
        excerpt:     ghost.custom_excerpt ?? undefined,
        tags:        ghost.tags?.map((t) => t.name) ?? [],
        published:   ghost.status === 'published',
        publishedAt: ghost.published_at ? new Date(ghost.published_at) : null,
        metadata: ({
          legacyDisqus:  true,
          category:      ghost.tags?.[0]?.name ?? undefined,
          // Author metadata
          authorName:    primaryAuthor?.name ?? 'Nsisong Effiong',
          authorSlug:    primaryAuthor?.slug ?? 'nsisong',
          // All authors if guest post
          authors:       authorsMeta.length > 0 ? authorsMeta : undefined,
          isGuestPost:   primaryAuthor?.slug !== 'nsisong' && primaryAuthor !== undefined,
        } as any),
        },
      })

      const authorLabel = primaryAuthor ? ` [${primaryAuthor.name}]` : ''
      const statusLabel = ghost.status === 'published' ? '✓' : '✎ draft'
      console.log(`  ${statusLabel} Migrated: "${ghost.title}" → /poetry/${slug}${authorLabel}`)
      migrated++
    } catch (error: any) {
      if (error?.code === '23505') {
        console.log(`  ↷ Already exists: "${ghost.title}" — skipping`)
        skipped++
      } else {
        console.error(`  ✗ Failed: "${ghost.title}"`, error.message)
        failed++
      }
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

migrate()
