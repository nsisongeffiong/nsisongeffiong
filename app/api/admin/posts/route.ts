import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) }
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)

  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, error: null }
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      type: posts.type,
      published: posts.published,
      publishedAt: posts.publishedAt,
      excerpt: posts.excerpt,
      slug: posts.slug,
    })
    .from(posts)
    .orderBy(desc(posts.publishedAt))

  return NextResponse.json(allPosts)
}
