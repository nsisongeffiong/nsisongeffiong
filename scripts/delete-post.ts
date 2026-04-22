import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function run() {
  await db.delete(posts).where(eq(posts.slug, 'crying-this-backlog-of-tears'))
  console.log('Deleted')
  process.exit(0)
}

run()
