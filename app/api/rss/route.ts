import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { absoluteUrl } from '@/lib/utils'

export async function GET() {
  try {
    const allPosts = await db
      .select({
        title:       posts.title,
        slug:        posts.slug,
        type:        posts.type,
        excerpt:     posts.excerpt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.publishedAt))
      .limit(50)

    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
    const buildDate = new Date().toUTCString()

    const items = allPosts
      .map((post) => {
        const href = absoluteUrl(`/${post.type}/${post.slug}`)
        const date = post.publishedAt
          ? new Date(post.publishedAt).toUTCString()
          : buildDate

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${href}</link>
      <guid isPermaLink="true">${href}</guid>
      <pubDate>${date}</pubDate>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ''}
      <category>${post.type}</category>
    </item>`
      })
      .join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nsisong Effiong</title>
    <link>${siteUrl}</link>
    <description>Poetry, code, and public thought — three modes of making sense of the world.</description>
    <language>en-gb</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('[GET /api/rss]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}
