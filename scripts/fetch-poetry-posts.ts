import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq, and, or, isNull } from 'drizzle-orm'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function run() {
  const poetryPosts = await db
    .select({ id: posts.id, title: posts.title, content: posts.content, excerpt: posts.excerpt, slug: posts.slug })
    .from(posts)
    .where(
      and(
        eq(posts.type, 'poetry'),
        eq(posts.published, true),
        or(isNull(posts.excerpt), eq(posts.excerpt, ''))
      )
    )

  console.log(`Found ${poetryPosts.length} published poetry posts with missing excerpts.\n`)

  for (const post of poetryPosts) {
    const plain = stripHtml(post.content ?? '')
    console.log('===START===')
    console.log(`ID: ${post.id}`)
    console.log(`TITLE: ${post.title}`)
    console.log(`SLUG: ${post.slug}`)
    console.log(`PLAIN_TEXT: ${plain}`)
    console.log('===END===\n')
  }

  process.exit(0)
}

run()
