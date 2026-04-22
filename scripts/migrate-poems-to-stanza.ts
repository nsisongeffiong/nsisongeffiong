import * as fs from 'fs'
import * as path from 'path'
import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

type GhostPost = {
  id:     string
  title:  string
  slug:   string
  html:   string | null
  status: string
  type:   string
}

type GhostExport = {
  db: [{ data: { posts: GhostPost[] } }]
}

// Count leading &nbsp; or space-like chars to determine indent level
function indentClass(line: string): string {
  const nbspCount = (line.match(/^(?:&nbsp;|\u00a0| )*/)?.[0].length ?? 0)
  // Each &nbsp; entity is 6 chars; plain nbsp char or space is 1
  const entityCount = (line.match(/^(?:&nbsp;)*/)?.[0].length ?? 0) / 6
  const charCount   = nbspCount <= entityCount * 6 ? entityCount : nbspCount

  if (charCount >= 2) return ' i2'
  if (charCount >= 1) return ' i1'
  return ''
}

function ghostHtmlToStanza(html: string): string {
  // Strip wrapping whitespace
  html = html.trim()

  // Split on paragraph tags — capture inner content
  const paragraphRe = /<p>([\s\S]*?)<\/p>/g
  const stanzas: string[] = []
  let match: RegExpExecArray | null

  while ((match = paragraphRe.exec(html)) !== null) {
    const inner = match[1]

    // Split on <br>, <br/>, or <br />
    const rawLines = inner.split(/<br\s*\/?>/)

    const lineSpans = rawLines
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => {
        const indent = indentClass(l)
        // Strip leading &nbsp; entities / nbsp chars / spaces used for indent
        const text = l.replace(/^(?:&nbsp;|\u00a0| )+/, '').trim()
        return `  <span class="line${indent}">${text}</span>`
      })

    if (lineSpans.length > 0) {
      stanzas.push(`<div class="stanza">\n${lineSpans.join('\n')}\n</div>`)
    }
  }

  return stanzas.join('\n\n')
}

async function migrate() {
  // Look for ghost-export.json in scripts/ first, then project root
  const candidates = [
    path.join(process.cwd(), 'scripts', 'ghost-export.json'),
    path.join(process.cwd(), 'ghost-export.json'),
  ]
  const exportPath = candidates.find(p => fs.existsSync(p))
  if (!exportPath) {
    console.error('ghost-export.json not found (checked scripts/ and project root)')
    process.exit(1)
  }

  const raw  = fs.readFileSync(exportPath, 'utf-8')
  const data = JSON.parse(raw) as GhostExport
  const ghostPosts = data.db[0].data.posts

  // Only migrate published poetry posts that have HTML content
  const poetryPosts = ghostPosts.filter(
    p => p.html && p.html.trim().length > 0 && p.type === 'post'
  )

  console.log(`Found ${ghostPosts.length} total Ghost posts`)
  console.log(`Found ${poetryPosts.length} posts with HTML content\n`)

  let updated = 0
  let notFound = 0
  let failed   = 0

  for (const ghost of poetryPosts) {
    const converted = ghostHtmlToStanza(ghost.html!)

    if (!converted) {
      console.log(`  ↷ No stanzas parsed: "${ghost.title}" (${ghost.slug}) — skipping`)
      continue
    }

    try {
      const result = await db
        .update(posts)
        .set({ content: converted, updatedAt: new Date() })
        .where(eq(posts.slug, ghost.slug))
        .returning({ id: posts.id, slug: posts.slug })

      if (result.length === 0) {
        console.log(`  ? Not in DB:  "${ghost.title}" (${ghost.slug})`)
        notFound++
      } else {
        console.log(`  ✓ Updated:   "${ghost.title}" → /poetry/${ghost.slug}`)
        updated++
      }
    } catch (err: any) {
      console.error(`  ✗ Failed:    "${ghost.title}"`, err.message)
      failed++
    }
  }

  console.log(`\nDone: ${updated} updated, ${notFound} not in DB, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

migrate()
