import 'dotenv/config'
/**
 * Backfill author metadata on already-migrated Ghost posts
 *
 * Usage: npx tsx scripts/backfill-ghost-authors.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

type GhostPost = {
  id:             string
  title:          string
  slug:           string
  status:         string
  published_at:   string | null
  custom_excerpt: string | null
  html:           string | null
  plaintext:      string | null
  tags?: { name: string }[]
}

type GhostUser = {
  id:    string
  name:  string
  slug:  string
  email: string
}

type GhostPostAuthor = {
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

async function backfill() {
  const exportPath = path.join(process.cwd(), 'ghost-export.json')
  const raw  = fs.readFileSync(exportPath, 'utf-8')
  const data = JSON.parse(raw) as GhostExport

  const ghostPosts   = data.db[0].data.posts
  const ghostUsers   = data.db[0].data.users         ?? []
  const postsAuthors = data.db[0].data.posts_authors ?? []

  const userMap = new Map<string, GhostUser>(
    ghostUsers.map((u) => [u.id, u])
  )

  const postAuthorsMap = new Map<string, GhostUser[]>()
  for (const pa of postsAuthors.sort((a, b) => a.sort_order - b.sort_order)) {
    const user = userMap.get(pa.author_id)
    if (!user) continue
    if (!postAuthorsMap.has(pa.post_id)) postAuthorsMap.set(pa.post_id, [])
    postAuthorsMap.get(pa.post_id)!.push(user)
  }

  console.log(`Backfilling author metadata for ${ghostPosts.length} posts...`)
  console.log('')

  let updated = 0
  let failed  = 0

  for (const ghost of ghostPosts) {
    const authors       = postAuthorsMap.get(ghost.id) ?? []
    const primaryAuthor = authors[0]
    const authorsMeta   = authors.map((u) => ({ name: u.name, slug: u.slug, email: u.email }))

    try {
      await db
        .update(posts)
        .set({
          published:   ghost.status === 'published',
          publishedAt: ghost.published_at ? new Date(ghost.published_at) : null,
          metadata: ({
            legacyDisqus: true,
            category:     ghost.tags?.[0]?.name ?? undefined,
            authorName:   primaryAuthor?.name ?? 'Nsisong Effiong',
            authorSlug:   primaryAuthor?.slug ?? 'nsisong',
            authors:      authorsMeta.length > 0 ? authorsMeta : undefined,
            isGuestPost:  primaryAuthor?.slug !== 'nsisong' && primaryAuthor !== undefined,
          } as any),
        })
        .where(eq(posts.slug, ghost.slug))

      const authorLabel = primaryAuthor ? ` [${primaryAuthor.name}]` : ''
      const statusLabel = ghost.status === 'published' ? '✓' : '✎ draft'
      console.log(`  ${statusLabel} Updated: "${ghost.title}"${authorLabel}`)
      updated++
    } catch (error: any) {
      console.error(`  ✗ Failed: "${ghost.title}"`, error.message)
      failed++
    }
  }

  console.log(`\nDone: ${updated} updated, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

backfill()
