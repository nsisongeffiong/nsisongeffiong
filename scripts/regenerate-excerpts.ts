import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function generateExcerpt(title: string, content: string): Promise<string> {
  const plainText = stripHtml(content).slice(0, 2000)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: `Write a single sentence excerpt for this essay. It should be exactly 1 sentence, between 130-160 characters, capturing the core argument. No quotes, no ellipsis. Just the sentence.

Title: ${title}

Content: ${plainText}

Excerpt (1 sentence, 130-160 chars):`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  return text.replace(/^["']|["']$/g, '').trim()
}

async function run() {
  const ideasPosts = await db
    .select({ id: posts.id, title: posts.title, content: posts.content, excerpt: posts.excerpt })
    .from(posts)
    .where(and(eq(posts.type, 'ideas'), eq(posts.published, true)))

  console.log(`Found ${ideasPosts.length} ideas posts to process\n`)

  for (const post of ideasPosts) {
    try {
      console.log(`Processing: "${post.title}"`)
      const newExcerpt = await generateExcerpt(post.title, post.content ?? '')
      console.log(`  New excerpt (${newExcerpt.length} chars): ${newExcerpt}`)

      await db
        .update(posts)
        .set({ excerpt: newExcerpt })
        .where(eq(posts.id, post.id))

      console.log(`  ✓ Updated\n`)

      // Rate limit — wait 500ms between requests
      await new Promise(r => setTimeout(r, 500))
    } catch (err: any) {
      console.error(`  ✗ Failed: ${err.message}\n`)
    }
  }

  console.log('Done.')
  process.exit(0)
}

run()
